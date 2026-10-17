# PayPal sandbox integration

All API requests are hardcoded to `https://api-m.sandbox.paypal.com`. There is no live endpoint setting. `PAYMENTS_ENABLED=false` is the default. Do not enter live credentials.

1. Owner creates/selects a sandbox REST app in the PayPal developer dashboard, with a business sandbox seller and a separate personal sandbox buyer.
2. Put client ID and secret into ignored root `.env` using a local editor. Never paste secrets into chat. Client ID is public SDK configuration; the secret remains server-only.
3. Set `PAYMENTS_ENABLED=true` only when ready to authorize sandbox order and buyer-checkout testing; restart backend. Leave `CAPTURE_ENABLED=false`.
4. Create a proposal and approve its displayed amount. The official PayPal button calls `/proposals/{id}/order`.
5. Server exchanges OAuth credentials, creates the order from its own validated amount and sends a stable request ID.
6. Buyer approves in the PayPal popup. The browser calls `/buyer-approval`; the server retrieves the order and checks ownership, amount, USD, custom ID, and `APPROVED` status before recording `BUYER_APPROVED`. No capture occurs in this callback.
7. Only after separate owner authorization, set the server-only `CAPTURE_ENABLED=true`. The authenticated user must then submit explicit capture confirmation. The server re-verifies the order, captures with a stable request ID, retrieves it again, and records completion only after verifying the completed capture.

API: `GET /catalog`, `POST /sessions`, `POST /proposals`, `GET /transactions`, `POST /proposals/{id}/approve`, `POST /proposals/{id}/order`, `POST /proposals/{id}/buyer-approval`, `POST /proposals/{id}/capture`, `GET /proposals/{id}/status`. FastAPI provides `/docs` and `/openapi.json`.

Generic API failures do not reveal provider payloads. Cancellation is displayed in the browser; there is no claim of a completed payment. Pending captures remain uncompleted locally until a later authenticated status refresh confirms them. No refund or shipment features.

No webhooks are consumed in this version. Future webhook handling must verify signatures and deduplicate event IDs before mutation. Current audit stores local timestamps, state events and order ID, never OAuth tokens, payer identity or raw API responses.

**Verification status (October 16, 2026):** genuine sandbox OAuth succeeded and exactly one `USD 59.00` order was created and retrieved with status `CREATED`. The returned order ID, custom ID, currency, and amount matched the backend proposal. Credentials and identifiers were redacted from reporting. No capture request was made, so the full buyer-approval and capture flow remains unverified. Opt-in `RUN_SANDBOX_SMOKE=true` runs only an OAuth test; checkout still requires human buyer approval.
