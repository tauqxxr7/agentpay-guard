import os
import time
import httpx
from fastapi import HTTPException

BASE = "https://api-m.sandbox.paypal.com"


class PayPal:
    def __init__(self):
        self.token = None
        self.expires = 0

    def call(self, method, path, body=None, request_id=None):
        if os.getenv("PAYMENTS_ENABLED") != "true":
            raise HTTPException(
                503, "Sandbox payments disabled. Owner configuration required."
            )
        client_id, secret = (
            os.getenv("PAYPAL_CLIENT_ID"),
            os.getenv("PAYPAL_CLIENT_SECRET"),
        )
        if not client_id or not secret:
            raise HTTPException(503, "Sandbox credentials are not configured.")
        try:
            with httpx.Client(timeout=20) as client:
                if not self.token or time.time() >= self.expires:
                    r = client.post(
                        BASE + "/v1/oauth2/token",
                        auth=(client_id, secret),
                        data={"grant_type": "client_credentials"},
                    )
                    r.raise_for_status()
                    data = r.json()
                    self.token = data["access_token"]
                    self.expires = time.time() + data["expires_in"] - 60
                headers = {
                    "Authorization": "Bearer " + self.token,
                    "Prefer": "return=representation",
                }
                if request_id:
                    headers["PayPal-Request-Id"] = request_id
                r = client.request(method, BASE + path, headers=headers, json=body)
                r.raise_for_status()
                return r.json()
        except (httpx.HTTPError, KeyError, ValueError):
            raise HTTPException(
                502,
                "PayPal sandbox request failed or timed out. Retry with the same proposal; never assume payment succeeded.",
            ) from None


paypal = PayPal()
