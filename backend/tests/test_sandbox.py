"""Opt-in read-only OAuth smoke test. Does not create or capture payments."""

import os
import httpx
import pytest


@pytest.mark.skipif(
    os.getenv("RUN_SANDBOX_SMOKE") != "true",
    reason="Requires explicit opt-in and genuine sandbox credentials",
)
def test_real_sandbox_oauth():
    r = httpx.post(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        auth=(os.environ["PAYPAL_CLIENT_ID"], os.environ["PAYPAL_CLIENT_SECRET"]),
        data={"grant_type": "client_credentials"},
        timeout=20,
    )
    assert r.status_code == 200
    assert r.json().get("access_token")
