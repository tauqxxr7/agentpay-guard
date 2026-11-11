"""Opt-in, non-payment hosted smoke test. Never print session credentials."""

import os
import re
import sys

import httpx


BASE = os.environ.get(
    "SMOKE_FRONTEND_URL", "https://agentpay-guard-nine.vercel.app"
).rstrip("/")
ORIGIN = BASE


def call(client, method, path, *, token=None, payload=None):
    headers = {"Origin": ORIGIN}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    response = client.request(
        method, BASE + "/api" + path, headers=headers, json=payload
    )
    safe_path = re.sub(r"/proposals/[^/]+", "/proposals/[redacted]", path.split("?")[0])
    print(
        f"{method} {safe_path} HTTP {response.status_code} "
        f"elapsed_ms={round(response.elapsed.total_seconds() * 1000)} "
        f"content_type={response.headers.get('content-type', '').split(';')[0]}"
    )
    if response.status_code >= 400:
        raise RuntimeError("hosted smoke test stopped")
    return response.json()


def main():
    with httpx.Client(timeout=65, follow_redirects=False) as client:
        ready = call(client, "GET", "/ready")
        print("database:", ready.get("database"), "schema:", ready.get("schema"))
        config = call(client, "GET", "/config")
        print(
            "payments_enabled:",
            config.get("payments_enabled"),
            "capture_enabled:",
            config.get("capture_enabled"),
        )
        if config.get("payments_enabled") or config.get("capture_enabled"):
            raise RuntimeError("payment flags are not disabled")
        session = call(client, "POST", "/sessions")["token"]
        catalog = call(client, "GET", "/catalog")
        keyboard = next(item for item in catalog if item["sku"] == "KEY-01")
        print("catalog:", keyboard["name"], keyboard["currency"], keyboard["cents"])
        try:
            proposal = call(
                client,
                "POST",
                "/proposals",
                token=session,
                payload={
                    "request": "A quiet wireless keyboard for my desk",
                    "budget_cents": 8000,
                    "quantity": 1,
                },
            )
        except (httpx.TimeoutException, RuntimeError):
            print("POST /proposals failed; checking owner history without retry")
            history_after_timeout = call(client, "GET", "/transactions", token=session)
            print("persisted_proposals_after_timeout:", len(history_after_timeout))
            raise
        if "id" not in proposal:
            print(
                "provider_mode:",
                proposal.get("mode"),
                "clarification:",
                bool(proposal.get("clarification")),
            )
            raise RuntimeError("model returned clarification; no proposal created")
        proposal_id = proposal["id"]
        print("proposal_id:", proposal_id[:6] + "..." + proposal_id[-4:])
        print("provider_mode:", proposal.get("mode"))
        print("product:", proposal["product"]["sku"], "quantity:", proposal["quantity"])
        print(
            "amount_cents:",
            proposal["total_cents"],
            "budget_cents:",
            proposal["budget_cents"],
        )
        print("policy:", proposal["policy"])
        if (
            proposal["product"]["sku"] != "KEY-01"
            or proposal["total_cents"] != 5900
            or not all(proposal["policy"].values())
        ):
            raise RuntimeError("proposal verification failed")
        history = call(client, "GET", "/transactions", token=session)
        if not any(row["id"] == proposal_id for row in history):
            raise RuntimeError("proposal missing from owner history")
        print("owner_history: PASS")
        other = call(client, "POST", "/sessions")["token"]
        other_history = call(client, "GET", "/transactions", token=other)
        if any(row["id"] == proposal_id for row in other_history):
            raise RuntimeError("ownership isolation failed")
        print("other_owner_history: isolated")
        approved = call(
            client,
            "POST",
            f"/proposals/{proposal_id}/approve",
            token=session,
            payload={"total_cents": 5900, "currency": "USD", "confirmed": True},
        )
        print("approved_state:", approved["state"])
        print("audit_events:", [entry["event"] for entry in approved["audit"]])
        refreshed = call(client, "GET", "/transactions", token=session)
        row = next(item for item in refreshed if item["id"] == proposal_id)
        print(
            "refresh_state:",
            row["state"],
            "order_associated:",
            bool(row.get("order_id")),
        )
        if row["state"] != "APPROVED" or row.get("order_id"):
            raise RuntimeError("unexpected persisted state")
        print("SMOKE PASS")


if __name__ == "__main__":
    try:
        main()
    except (httpx.HTTPError, ValueError, KeyError, RuntimeError) as exc:
        print("SMOKE FAIL:", type(exc).__name__)
        sys.exit(1)
