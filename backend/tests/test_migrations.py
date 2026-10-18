import os
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session

from app import main


BACKEND = Path(__file__).resolve().parents[1]


def alembic_config(url: str) -> Config:
    config = Config(str(BACKEND / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND / "migrations"))
    config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
    return config


def test_clean_sqlite_migration_and_restart_persistence(tmp_path, monkeypatch):
    url = f"sqlite:///{(tmp_path / 'restart.db').as_posix()}"
    monkeypatch.setenv("DATABASE_URL", url)
    command.upgrade(alembic_config(url), "head")
    first = create_engine(url)
    token_hash = "owner-hash"
    with Session(first) as session:
        session.add(main.BrowserSession(token=token_hash, created=1.0, calls=2))
        session.add(
            main.Proposal(
                id="proposal-1",
                owner=token_hash,
                data={"product": {"sku": "KEY-01"}, "total_cents": 5900},
                state="ORDER_CREATED",
                order_id="sandbox-order-1",
                created=1.0,
                audit=[{"event": "ORDER_CREATED"}],
            )
        )
        session.commit()
    first.dispose()
    restarted = create_engine(url)
    with Session(restarted) as session:
        proposal = session.get(main.Proposal, "proposal-1")
        assert proposal.owner == token_hash
        assert proposal.order_id == "sandbox-order-1"
        assert proposal.audit == [{"event": "ORDER_CREATED"}]
        assert session.get(main.BrowserSession, token_hash).calls == 2
    restarted.dispose()
    command.downgrade(alembic_config(url), "base")
    assert inspect(create_engine(url)).get_table_names() == ["alembic_version"]


@pytest.mark.skipif(
    not os.getenv("TEST_POSTGRES_URL"),
    reason="Requires a disposable PostgreSQL database",
)
def test_real_postgres_migration_restart_ownership_and_idempotency(monkeypatch):
    url = main.normalize_database_url(os.environ["TEST_POSTGRES_URL"])
    monkeypatch.setenv("DATABASE_URL", url)
    config = alembic_config(url)
    command.downgrade(config, "base")
    command.upgrade(config, "head")
    assert {"sessions", "proposals", "rate_limit_buckets"}.issubset(
        inspect(create_engine(url)).get_table_names()
    )

    postgres_engine = create_engine(url, pool_pre_ping=True)
    monkeypatch.setattr(main, "engine", postgres_engine)
    monkeypatch.delenv("AI_PROVIDER", raising=False)
    monkeypatch.setenv("PAYMENTS_ENABLED", "true")
    monkeypatch.setenv("PAYPAL_MERCHANT_ID", "TEST-MERCHANT")
    calls = []

    with TestClient(main.app) as client:
        token = client.post("/sessions").json()["token"]
        client.headers["Authorization"] = "Bearer " + token
        proposal = client.post(
            "/proposals",
            json={"request": "wireless keyboard", "budget_cents": 8000},
        ).json()
        client.post(
            f"/proposals/{proposal['id']}/approve",
            json={"total_cents": 5900, "currency": "USD", "confirmed": True},
        )

        def paypal_call(method, path, body=None, request_id=None):
            calls.append((method, path, request_id))
            if method == "POST":
                return {
                    "id": "PG-ORDER",
                    "purchase_units": [{"payee": {"merchant_id": "TEST-MERCHANT"}}],
                }
            return {
                "id": "PG-ORDER",
                "status": "APPROVED",
                "purchase_units": [{
                    "custom_id": proposal["id"],
                    "amount": {"currency_code": "USD", "value": "59.00"},
                    "payee": {"merchant_id": "TEST-MERCHANT"},
                }],
            }

        monkeypatch.setattr(main.paypal, "call", paypal_call)
        path = f"/proposals/{proposal['id']}"
        assert client.post(path + "/order").status_code == 200
        assert client.post(path + "/order").status_code == 200
        assert client.post(path + "/buyer-approval").status_code == 200
        assert client.post(path + "/buyer-approval").status_code == 200

    postgres_engine.dispose()
    restarted = create_engine(url, pool_pre_ping=True)
    monkeypatch.setattr(main, "engine", restarted)
    with TestClient(main.app) as client:
        client.headers["Authorization"] = "Bearer " + token
        history = client.get("/transactions").json()
        assert history[0]["order_id"] == "PG-ORDER"
        assert history[0]["state"] == "BUYER_APPROVED"
        assert [e["event"] for e in history[0]["audit"]].count(
            "PAYPAL_BUYER_APPROVED"
        ) == 1
        other = TestClient(main.app)
        other_token = other.post("/sessions").json()["token"]
        other.headers["Authorization"] = "Bearer " + other_token
        assert other.get(f"/proposals/{proposal['id']}/status").status_code == 404
        other.close()
    assert len([call for call in calls if call[0] == "POST"]) == 1
    restarted.dispose()
    command.downgrade(config, "base")
