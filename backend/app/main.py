import hashlib
import logging
import os
import secrets
import time
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal
from fastapi import FastAPI, Depends, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import create_engine, String, JSON, select, update, text, Index
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from .catalog import CATALOG, product, policy
from .agent import recommend
from .paypal import paypal


class Base(DeclarativeBase):
    pass


class BrowserSession(Base):
    __tablename__ = "sessions"
    token: Mapped[str] = mapped_column(String, primary_key=True)
    created: Mapped[float]
    calls: Mapped[int] = mapped_column(default=0)


class RateLimitBucket(Base):
    __tablename__ = "rate_limit_buckets"
    key: Mapped[str] = mapped_column(String, primary_key=True)
    count: Mapped[int] = mapped_column(default=0)
    expires: Mapped[float]


class Proposal(Base):
    __tablename__ = "proposals"
    __table_args__ = (Index("ix_proposals_owner_created", "owner", "created"),)
    id: Mapped[str] = mapped_column(String, primary_key=True)
    owner: Mapped[str]
    data: Mapped[dict] = mapped_column(JSON)
    state: Mapped[str] = mapped_column(default="PROPOSED")
    order_id: Mapped[str | None] = mapped_column(nullable=True, unique=True)
    created: Mapped[float]
    audit: Mapped[list] = mapped_column(JSON, default=list)


logger = logging.getLogger(__name__)


def normalize_database_url(value: str) -> str:
    if value.startswith("postgres://"):
        return "postgresql+psycopg://" + value.removeprefix("postgres://")
    if value.startswith("postgresql://"):
        return "postgresql+psycopg://" + value.removeprefix("postgresql://")
    return value


url = normalize_database_url(os.getenv("DATABASE_URL", "sqlite:///./agentpay.db"))
engine = create_engine(
    url,
    connect_args={"check_same_thread": False} if url.startswith("sqlite") else {},
    pool_pre_ping=not url.startswith("sqlite"),
)


@asynccontextmanager
async def lifespan(app):
    if os.getenv("PAYMENTS_ENABLED") == "true" and not os.getenv("PAYPAL_MERCHANT_ID"):
        raise RuntimeError("PAYPAL_MERCHANT_ID is required when sandbox payments are enabled")
    yield


app = FastAPI(title="AgentPay Guard", lifespan=lifespan)
allowed_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip() and origin.strip() != "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


def db():
    with Session(engine) as s:
        yield s


def owner(authorization: str = Header(default=""), s: Session = Depends(db)):
    token = hashlib.sha256(authorization.removeprefix("Bearer ").encode()).hexdigest()
    row = s.get(BrowserSession, token)
    if not row or time.time() - row.created > 86400:
        raise HTTPException(401, "Session expired. Reload to start a new session.")
    return token


def limited(s, token):
    result = s.execute(
        update(BrowserSession)
        .where(BrowserSession.token == token, BrowserSession.calls < 100)
        .values(calls=BrowserSession.calls + 1)
    )
    s.commit()
    if not result.rowcount:
        raise HTTPException(429, "Session request limit reached.")


def consume_quota(s, name: str, limit: int, seconds: int):
    """Consume a database-backed shared quota that works across workers."""
    if limit < 1:
        raise HTTPException(503, "Service quota is disabled by operator configuration.")
    now = time.time()
    window = int(now // seconds)
    key = f"{name}:{window}"
    values = {"key": key, "count": 0, "expires": (window + 1) * seconds}
    dialect = s.bind.dialect.name
    if dialect == "postgresql":
        s.execute(pg_insert(RateLimitBucket).values(**values).on_conflict_do_nothing())
    elif dialect == "sqlite":
        s.execute(sqlite_insert(RateLimitBucket).values(**values).on_conflict_do_nothing())
    else:
        if not s.get(RateLimitBucket, key):
            s.add(RateLimitBucket(**values))
            s.flush()
    result = s.execute(
        update(RateLimitBucket)
        .where(RateLimitBucket.key == key, RateLimitBucket.count < limit)
        .values(count=RateLimitBucket.count + 1)
    )
    s.commit()
    if not result.rowcount:
        raise HTTPException(429, "Public demo request quota reached. Try again later.")


def owned(s, id, token):
    p = s.scalar(select(Proposal).where(Proposal.id == id).with_for_update())
    if not p or p.owner != token:
        raise HTTPException(404, "Proposal not found")
    return p


def event(p, name):
    p.audit = [*p.audit, {"event": name, "at": datetime.now(timezone.utc).isoformat()}]


def view(p):
    return dict(
        id=p.id,
        **p.data,
        state=p.state,
        order_id=p.order_id,
        created_at=datetime.fromtimestamp(p.created, timezone.utc).isoformat(),
        audit=p.audit,
    )


def validate(p):
    if time.time() - p.created > 1800:
        raise HTTPException(409, "Proposal expired; request a new recommendation.")
    d = p.data
    if not all(
        policy(
            product(d["product"]["sku"]),
            d["budget_cents"],
            d["quantity"],
            d["total_cents"],
        ).values()
    ):
        raise HTTPException(409, "Catalog or policy changed; request a new proposal.")


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class PurchaseRequest(Strict):
    request: str = Field(min_length=3, max_length=1000)
    budget_cents: int = Field(strict=True, gt=0, le=100000)
    quantity: int = Field(default=1, strict=True, ge=1, le=10)


class Approval(Strict):
    total_cents: int = Field(strict=True)
    currency: Literal["USD"]
    confirmed: Literal[True]


class CaptureAuthorization(Strict):
    confirmed: Literal[True]


@app.get("/health")
def health():
    return {"status": "ok", "environment": "sandbox"}


@app.get("/ready")
def ready(s: Session = Depends(db)):
    try:
        s.execute(text("SELECT 1"))
    except Exception as exc:
        logger.warning("readiness database failure type=%s", type(exc).__name__)
        raise HTTPException(503, "Database is unavailable") from None
    return {"status": "ready", "database": engine.dialect.name}


@app.get("/config")
def config():
    return {
        "payments_enabled": os.getenv("PAYMENTS_ENABLED") == "true"
        and bool(os.getenv("PAYPAL_CLIENT_ID"))
        and bool(os.getenv("PAYPAL_CLIENT_SECRET")),
        "client_id": os.getenv("PAYPAL_CLIENT_ID", ""),
        "capture_enabled": os.getenv("CAPTURE_ENABLED") == "true",
    }


@app.post("/sessions")
def session(s: Session = Depends(db)):
    consume_quota(
        s,
        "session-create",
        int(os.getenv("SESSION_CREATION_LIMIT_PER_MINUTE", "30")),
        60,
    )
    token = secrets.token_urlsafe(32)
    s.add(
        BrowserSession(
            token=hashlib.sha256(token.encode()).hexdigest(), created=time.time()
        )
    )
    s.commit()
    return {"token": token}


@app.get("/catalog")
def catalog():
    return CATALOG


@app.post("/proposals")
def propose(body: PurchaseRequest, token=Depends(owner), s: Session = Depends(db)):
    limited(s, token)
    if (
        os.getenv("AI_PROVIDER", "").lower() == "gemini"
        and os.getenv("GEMINI_API_KEY")
        and os.getenv("GEMINI_MODEL")
    ):
        consume_quota(
            s,
            "gemini",
            int(os.getenv("GEMINI_REQUESTS_PER_HOUR", "30")),
            3600,
        )
    intent, mode = recommend(body.request, body.budget_cents, body.quantity)
    if not intent.sku:
        return {"clarification": intent.clarification, "mode": mode}
    item = product(intent.sku)
    checks = policy(item, body.budget_cents, body.quantity)
    if not all(checks.values()):
        raise HTTPException(422, "Recommendation violates policy")
    data = dict(
        product=item,
        quantity=body.quantity,
        total_cents=item["cents"] * body.quantity,
        budget_cents=body.budget_cents,
        policy=checks,
        mode=mode,
        reasoning=f"{item['name']}: {', '.join(item['attributes'])}. Total fits the explicit USD budget.",
    )
    p = Proposal(
        id=str(uuid.uuid4()), owner=token, data=data, created=time.time(), audit=[]
    )
    event(p, "PROPOSED")
    s.add(p)
    s.commit()
    return view(p)


@app.get("/transactions")
def history(token=Depends(owner), s: Session = Depends(db)):
    return [
        view(p)
        for p in s.scalars(
            select(Proposal)
            .where(Proposal.owner == token)
            .order_by(Proposal.created.desc())
        )
    ]


@app.post("/proposals/{id}/approve")
def approve(id: str, body: Approval, token=Depends(owner), s: Session = Depends(db)):
    p = owned(s, id, token)
    validate(p)
    if body.total_cents != p.data["total_cents"]:
        raise HTTPException(409, "Amount mismatch")
    if p.state not in {"PROPOSED", "APPROVED"}:
        raise HTTPException(409, "Invalid approval state")
    if p.state == "PROPOSED":
        p.state = "APPROVED"
        event(p, "HUMAN_APPROVED")
        s.commit()
    return view(p)


@app.post("/proposals/{id}/order")
def order(id: str, token=Depends(owner), s: Session = Depends(db)):
    limited(s, token)
    p = owned(s, id, token)
    validate(p)
    if p.order_id:
        return {"id": p.order_id}
    if p.state != "APPROVED":
        raise HTTPException(409, "Explicit approval required")
    result = paypal.call(
        "POST",
        "/v2/checkout/orders",
        {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": p.id,
                    "custom_id": p.id,
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{p.data['total_cents'] / 100:.2f}",
                    },
                }
            ],
        },
        "create-" + p.id,
    )
    units = result.get("purchase_units", [])
    merchant_id = (
        units[0].get("payee", {}).get("merchant_id") if len(units) == 1 else None
    )
    if not merchant_id:
        raise HTTPException(502, "PayPal order did not identify the sandbox merchant")
    p.order_id = result["id"]
    p.data = {**p.data, "paypal_merchant_id": merchant_id}
    p.state = "ORDER_CREATED"
    event(p, "ORDER_CREATED")
    s.commit()
    return {"id": p.order_id}


def reconcile(p, result):
    units = result.get("purchase_units", [])
    if len(units) != 1:
        raise HTTPException(502, "Unexpected PayPal purchase units")
    unit = units[0]
    amount = unit.get("amount", {})
    merchant_id = unit.get("payee", {}).get("merchant_id")
    expected = {"currency_code": "USD", "value": f"{p.data['total_cents'] / 100:.2f}"}
    amount_matches = all(amount.get(key) == value for key, value in expected.items())
    if (
        result.get("id") != p.order_id
        or unit.get("custom_id") != p.id
        or not amount_matches
        or (
            p.data.get("paypal_merchant_id")
            and merchant_id != p.data["paypal_merchant_id"]
        )
    ):
        raise HTTPException(502, "PayPal order verification mismatch")
    status = result.get("status")
    if status == "APPROVED" and p.state == "ORDER_CREATED":
        p.state = "BUYER_APPROVED"
        event(p, "PAYPAL_BUYER_APPROVED")
    captures = unit.get("payments", {}).get("captures", [])
    if (
        status == "COMPLETED"
        and len(captures) == 1
        and captures[0].get("status") == "COMPLETED"
        and all(
            captures[0].get("amount", {}).get(key) == value
            for key, value in expected.items()
        )
    ):
        if p.state != "COMPLETED":
            p.state = "COMPLETED"
            event(p, "CAPTURE_VERIFIED")
    return status


@app.post("/proposals/{id}/resume")
def resume(id: str, token=Depends(owner), s: Session = Depends(db)):
    """Verify and return an existing Sandbox order; never create a replacement."""
    limited(s, token)
    p = owned(s, id, token)
    if p.state != "ORDER_CREATED" or not p.order_id:
        raise HTTPException(409, "No created PayPal order is eligible for checkout resume")
    expected_merchant = os.getenv("PAYPAL_MERCHANT_ID", "")
    if not expected_merchant:
        raise HTTPException(503, "Sandbox merchant identity is not configured for recovery")
    result = paypal.call("GET", "/v2/checkout/orders/" + p.order_id)
    units = result.get("purchase_units", [])
    merchant_id = (
        units[0].get("payee", {}).get("merchant_id") if len(units) == 1 else None
    )
    if merchant_id != expected_merchant:
        raise HTTPException(502, "PayPal order verification mismatch")
    status = reconcile(p, result)
    if status == "CREATED":
        return {"id": p.order_id, "status": status, "proposal": view(p)}
    if status == "APPROVED":
        s.commit()
        return {"id": p.order_id, "status": status, "proposal": view(p)}
    if status in {"VOIDED", "COMPLETED"}:
        if status == "VOIDED":
            p.state = "EXPIRED"
            event(p, "PAYPAL_ORDER_EXPIRED")
        s.commit()
        raise HTTPException(409, f"PayPal order is no longer resumable ({status})")
    p.state = "FAILED"
    event(p, "PAYPAL_ORDER_RESUME_FAILED")
    s.commit()
    raise HTTPException(409, f"PayPal order is not resumable ({status or 'UNKNOWN'})")


@app.post("/proposals/{id}/buyer-approval")
def buyer_approval(id: str, token=Depends(owner), s: Session = Depends(db)):
    p = owned(s, id, token)
    if p.state not in {"ORDER_CREATED", "BUYER_APPROVED"} or not p.order_id:
        raise HTTPException(409, "No checkout order awaiting buyer approval")
    state = reconcile(p, paypal.call("GET", "/v2/checkout/orders/" + p.order_id))
    if state != "APPROVED" and p.state != "COMPLETED":
        raise HTTPException(409, "PayPal buyer approval is not verified")
    s.commit()
    return view(p)


@app.get("/proposals/{id}/status")
def status(id: str, token=Depends(owner), s: Session = Depends(db)):
    p = owned(s, id, token)
    if p.order_id:
        reconcile(p, paypal.call("GET", "/v2/checkout/orders/" + p.order_id))
        s.commit()
    return view(p)


@app.post("/proposals/{id}/capture")
def capture(
    id: str,
    body: CaptureAuthorization,
    token=Depends(owner),
    s: Session = Depends(db),
):
    limited(s, token)
    if os.getenv("CAPTURE_ENABLED") != "true":
        raise HTTPException(403, "Sandbox capture requires separate owner authorization")
    p = owned(s, id, token)
    if p.state == "COMPLETED":
        return view(p)
    if p.state not in {"ORDER_CREATED", "BUYER_APPROVED"} or not p.order_id:
        raise HTTPException(409, "No buyer-approved checkout order")
    result = paypal.call("GET", "/v2/checkout/orders/" + p.order_id)
    state = reconcile(p, result)
    if p.state == "COMPLETED":
        s.commit()
        return view(p)
    validate(p)
    if state != "APPROVED" or p.state != "BUYER_APPROVED":
        raise HTTPException(409, "PayPal buyer approval required")
    paypal.call(
        "POST", "/v2/checkout/orders/" + p.order_id + "/capture", {}, "capture-" + p.id
    )
    reconcile(p, paypal.call("GET", "/v2/checkout/orders/" + p.order_id))
    s.commit()
    return view(p)
