# Feasibility — checked October 16, 2026

**GO for the implemented Sandbox buyer-approval slice.** Sandbox OAuth, order creation, buyer approval and server-side lookup were genuinely verified. Capture is implemented behind a separate disabled gate but has not been exercised. No concept pivot.

## Official evidence

- [Hackathon rules](https://paypalaihackathon.devpost.com/rules): PayPal sandbox plus AI required; functional build, public licensed repository, English submission and public YouTube demonstration under three minutes. Reproducible local setup is acceptable instead of hosting. Five equally weighted judging criteria cover implementation, design, impact, innovation and presentation.
- Deadline: November 12, 2026, 12:00 PST = **November 13, 2026, 01:30 IST**. India is not among the explicitly named excluded locations; age, residency, conflicts and legal eligibility still require entrant confirmation.
- [Standard Checkout](https://developer.paypal.com/studio/checkout/standard/integrate): server creation and capture with JavaScript SDK buyer interaction. The implementation uses the documented Buttons integration. A separate newer v6 SDK exists; migrating is not necessary for this slice but account compatibility needs real verification.
- [OAuth](https://developer.paypal.com/api/rest/authentication/): client credentials exchange for a server-held bearer token.
- [Orders v2](https://developer.paypal.com/api/orders/v2): create, retrieve and capture lifecycle. Stable PayPal-Request-Id values support retrying the same logical operation within PayPal's retention window.
- [Sandbox accounts](https://developer.paypal.com/sandbox-testing/accounts): separate business seller and personal buyer test accounts. Developer dashboard access is required. Do not assume live domestic-payment rules or every funding method apply to sandbox; account/country eligibility must be tested.
- [Webhooks](https://developer.paypal.com/api/rest/webhooks/rest/): supported with verification. Deferred here; server GET reconciliation is used instead. There is no webhook ingestion endpoint accepting unverified events.
- [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output): the official Google Gen AI SDK accepts Pydantic response schemas. The hosted adapter uses server-side credentials, no tools, bounded retries, Pydantic validation and deterministic post-validation. A configured API key, available model and quota are required.

## Repository verification

The public repository exists at `https://github.com/tauqxxr7/agentpay-guard`. Remote synchronization must still be checked after every release commit.

## Alternative comparison

AgentPay Guard has a direct, demonstrable checkout path and explicit approval boundary. ResolveIQ is unspecified in the brief; assumed dispute-resolution concept would require additional dispute data/access and cannot be verified as simpler. Keep AgentPay Guard; revisit only if sandbox account access fails.

## Blocking gates

Sandbox and Gemini credentials are configured locally and remain ignored. PostgreSQL verification, hosting, recording/upload, entrant eligibility and submission remain incomplete. Any future capture still requires separate explicit authorization.
