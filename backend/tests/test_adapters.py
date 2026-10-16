import httpx
import pytest
from fastapi import HTTPException
from app.agent import recommend
from app.paypal import PayPal


@pytest.mark.parametrize(
    "payload,mode",
    [
        ('{"sku":"KEY-01","clarification":null}', "hosted AI"),
        ('{"sku":"FAKE","clarification":null}', "deterministic fallback (non-AI)"),
        ('{"sku":"MON-01","clarification":null}', "deterministic fallback (non-AI)"),
        ("not json", "deterministic fallback (non-AI)"),
        ('{"sku":"KEY-01","capture":true}', "deterministic fallback (non-AI)"),
    ],
)
def test_hosted_output_validation(monkeypatch, payload, mode):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-only")
    monkeypatch.setenv("ANTHROPIC_MODEL", "test-model")
    original = httpx.Client

    def handler(request):
        assert request.url.host == "api.anthropic.com"
        assert b'"tools"' not in request.content
        return httpx.Response(200, json={"content": [{"text": payload}]})

    monkeypatch.setattr(
        httpx,
        "Client",
        lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs),
    )
    intent, actual = recommend("wireless keyboard", 8000, 1)
    assert actual == mode
    assert intent.sku == "KEY-01"


def test_paypal_sandbox_oauth_and_idempotency(monkeypatch):
    monkeypatch.setenv("PAYMENTS_ENABLED", "true")
    monkeypatch.setenv("PAYPAL_CLIENT_ID", "test-id")
    monkeypatch.setenv("PAYPAL_CLIENT_SECRET", "test-secret")
    original = httpx.Client
    paths = []

    def handler(request):
        assert request.url.host == "api-m.sandbox.paypal.com"
        paths.append(request.url.path)
        if request.url.path.endswith("/token"):
            return httpx.Response(
                200, json={"access_token": "test-token", "expires_in": 3600}
            )
        assert request.headers["PayPal-Request-Id"] == "same-request"
        assert request.headers["Authorization"] == "Bearer test-token"
        return httpx.Response(200, json={"id": "TEST"})

    monkeypatch.setattr(
        httpx,
        "Client",
        lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs),
    )
    provider = PayPal()
    for _ in range(2):
        assert (
            provider.call("POST", "/v2/checkout/orders", {}, "same-request")["id"]
            == "TEST"
        )
    assert paths.count("/v1/oauth2/token") == 1


def test_paypal_timeout_redacts_secrets(monkeypatch):
    monkeypatch.setenv("PAYMENTS_ENABLED", "true")
    monkeypatch.setenv("PAYPAL_CLIENT_ID", "test-id")
    monkeypatch.setenv("PAYPAL_CLIENT_SECRET", "test-secret")
    original = httpx.Client

    def handler(request):
        raise httpx.ReadTimeout("test-secret")

    monkeypatch.setattr(
        httpx,
        "Client",
        lambda **kwargs: original(transport=httpx.MockTransport(handler), **kwargs),
    )
    with pytest.raises(HTTPException) as error:
        PayPal().call("POST", "/v2/checkout/orders", {})
    assert error.value.status_code == 502
    assert "test-secret" not in error.value.detail
