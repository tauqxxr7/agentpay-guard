# Evaluation — updated October 18, 2026

## Measured local results

| Check | Result | Scope |
|---|---|---|
| pytest | 100 passed, 1 skipped | Local SQLite, deterministic logic and mocked provider responses; opt-in credential test skipped |
| Synthetic evaluation | 60 / 60 passed | Ten request families × six budget boundaries; included in pytest total |
| Playwright | 10 passed | Desktop and mobile-emulated Chrome flows |
| ESLint | Passed | Frontend source |
| TypeScript | Passed | Strict compilation |
| Next.js production build | Passed | Local build only |
| npm production audit | Passed | 0 known vulnerabilities after Next.js 16.4.2 update |
| Ruff critical-error checks | Passed | E9,F63,F7,F82; Python formatting also applied |
| Genuine sandbox OAuth | Passed | Real Sandbox API, October 16, 2026 |
| Genuine sandbox order creation | Passed | Exactly one USD 59.00 order; retrieved as CREATED and fields matched |
| Genuine sandbox buyer approval | Passed | One USD 59.00 order reached PayPal APPROVED and backend BUYER_APPROVED |
| Genuine sandbox capture | Not run | Zero capture calls; `CAPTURE_ENABLED=false` |
| Genuine hosted AI | Partial pass | One structured request succeeded; broader hosted suite hit provider availability/quota limits |
| PostgreSQL | Not run | SQLite used locally |
| Hosted deployment | Not run | No public application URL exists |

Synthetic scenarios cover affordable and unaffordable products, wireless/quiet/noise-cancelling preferences, unsupported requests and unsafe payment-tool instructions. Expected outputs are independently specified in the parameter table. This is a small deterministic evaluation, **not an LLM accuracy benchmark**. No claim of general prompt-injection robustness or live AI success follows from it.

Other tests cover explicit approval, amount tampering, session isolation, expiry, merchant/category/stock denial, price changes, forged client status, repeated capture, buyer approval, quotas, invalid model JSON/SKUs and tool fields, OAuth caching, sandbox host enforcement, request IDs, timeout redaction and provider fallback.

Browser flow one uses the real local backend/database through the Next.js proxy for proposal → approval → audit/history. Flow two checks budget rejection and catalog comparison. Flow three explicitly replaces the external PayPal SDK and order response with fixtures to verify initiation and cancellation wiring; it never represents an actual payment.

Actual local screenshots are in `docs/screenshots/`; they display the labelled non-AI fallback and disabled checkout. Visual review included desktop/mobile layout and encoding. A browser regression assertion detects the encoding corruption found and fixed during development.

The final genuine PayPal milestone reused an existing USD 59.00 Sandbox order. After the buyer completed official checkout, PayPal returned `APPROVED`. The backend independently retrieved the order from `api-m.sandbox.paypal.com`, verified order and proposal identity, merchant, amount and currency, then advanced to `BUYER_APPROVED`. The audit contained `PAYPAL_BUYER_APPROVED` exactly once. Sensitive identifiers were redacted. No capture endpoint or PayPal capture API was called and `CAPTURE_ENABLED=false`.

Initial failures: pytest reserved parameter name, Next link lint rule, Windows subprocess sandbox EPERM, and corrupted symbols identified visually. These were corrected; subprocess checks ran with approved escalation. No failed test result was substituted with a mock success claim.

October 16 Phase 3 rerun: 79 backend tests passed and 1 credential-gated OAuth test skipped; Ruff check and format check passed; ESLint, TypeScript, Next.js 16.4.2 production build, and all 6 Playwright tests passed. An initial parallel browser/install run exhausted memory and timed out one navigation; the dependency install and suite were rerun sequentially and passed. The npm production audit initially found a critical vulnerability in Next.js 16.3.5; upgrading to 16.4.2 reduced the audit result to zero known production vulnerabilities.

October 17 integration freeze: one genuine Gemini request using `gemini-flash-latest` resolved to `gemini-3.8-flash`, returned schema-valid grounded output, and completed in 24,434 ms. Reported usage was 540 prompt, 48 response, and 686 total tokens. Remaining hosted cases received 503/429 provider responses and were not counted as passes. The release regression passed 90 backend tests with 1 credential-gated test skipped, Ruff, ESLint, TypeScript, the Next.js production build, and all 6 Playwright desktop/mobile tests. PayPal order creation and capture were not called.

October 18 buyer-approval milestone: PayPal Sandbox buyer approval and backend reconciliation passed as described above. The release-documentation regression passed 100 backend tests with 1 opt-in test skipped, Ruff, ESLint, TypeScript, the Next.js production build and all 10 Playwright tests. This is evidence for the implemented hackathon slice, not PostgreSQL, deployment or production readiness.

Commands: `python -m pytest -q backend`; `python -m ruff format backend`; `python -m ruff check backend --select E9,F63,F7,F82`; frontend `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
