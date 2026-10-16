# Evaluation — October 16, 2026

## Measured local results

| Check | Result | Scope |
|---|---|---|
| pytest | 79 passed, 1 skipped | Local SQLite, deterministic logic and mocked provider responses |
| Synthetic evaluation | 60 / 60 passed | Ten request families × six budget boundaries; included in pytest total |
| Playwright | 6 passed | Three flows on desktop Chrome and mobile-emulated Chrome |
| ESLint | Passed | Frontend source |
| TypeScript | Passed | Strict compilation |
| Next.js production build | Passed | Local build only |
| npm production audit | Passed | 0 known vulnerabilities after Next.js 16.4.2 update |
| Ruff critical-error checks | Passed | E9,F63,F7,F82; Python formatting also applied |
| Genuine sandbox OAuth | Passed | Real Sandbox API, October 16, 2026 |
| Genuine sandbox order creation | Passed | Exactly one USD 59.00 order; retrieved as CREATED and fields matched |
| Genuine sandbox checkout/capture | Not run | Human buyer authorization required; zero capture calls made |
| Genuine hosted AI | Not run | Provider key/model absent |
| PostgreSQL | Not run | SQLite used locally |
| Hosted deployment | Not run | Not authorized/published |

Synthetic scenarios cover affordable and unaffordable products, wireless/quiet/noise-cancelling preferences, unsupported requests and unsafe payment-tool instructions. Expected outputs are independently specified in the parameter table. This is a small deterministic evaluation, **not an LLM accuracy benchmark**. No claim of general prompt-injection robustness or live AI success follows from it.

Other tests cover explicit approval, amount tampering, session isolation, expiry, merchant/category/stock denial, price changes, forged client status, repeated capture, buyer approval, quotas, invalid model JSON/SKUs and tool fields, OAuth caching, sandbox host enforcement, request IDs, timeout redaction and provider fallback.

Browser flow one uses the real local backend/database through the Next.js proxy for proposal → approval → audit/history. Flow two checks budget rejection and catalog comparison. Flow three explicitly replaces the external PayPal SDK and order response with fixtures to verify initiation and cancellation wiring; it never represents an actual payment.

Actual local screenshots are in `docs/screenshots/`; they display the labelled non-AI fallback and disabled checkout. Visual review included desktop/mobile layout and encoding. A browser regression assertion detects the encoding corruption found and fixed during development.

The genuine PayPal verification used the existing approval and order endpoints: a local proposal reached `APPROVED`, the backend authenticated with its locally stored sandbox credentials, issued one create-order request, and retrieved that order from `api-m.sandbox.paypal.com`. The response was `CREATED`, `USD`, `59.00`; order ID/custom ID/amount checks passed. Sensitive identifiers were redacted. No capture endpoint or PayPal capture API was called.

Initial failures: pytest reserved parameter name, Next link lint rule, Windows subprocess sandbox EPERM, and corrupted symbols identified visually. These were corrected; subprocess checks ran with approved escalation. No failed test result was substituted with a mock success claim.

October 16 Phase 3 rerun: 79 backend tests passed and 1 credential-gated OAuth test skipped; Ruff check and format check passed; ESLint, TypeScript, Next.js 16.4.2 production build, and all 6 Playwright tests passed. An initial parallel browser/install run exhausted memory and timed out one navigation; the dependency install and suite were rerun sequentially and passed. The npm production audit initially found a critical vulnerability in Next.js 16.3.5; upgrading to 16.4.2 reduced the audit result to zero known production vulnerabilities.

Commands: `python -m pytest -q backend`; `python -m ruff format backend`; `python -m ruff check backend --select E9,F63,F7,F82`; frontend `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
