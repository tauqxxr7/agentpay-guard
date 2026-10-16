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
| Ruff critical-error checks | Passed | E9,F63,F7,F82; Python formatting also applied |
| Genuine sandbox OAuth | Skipped | Explicit opt-in and credentials absent |
| Genuine sandbox checkout/capture | Not run | Human buyer authorization required |
| Genuine hosted AI | Not run | Provider key/model absent |
| PostgreSQL | Not run | SQLite used locally |
| Hosted deployment | Not run | Not authorized/published |

Synthetic scenarios cover affordable and unaffordable products, wireless/quiet/noise-cancelling preferences, unsupported requests and unsafe payment-tool instructions. Expected outputs are independently specified in the parameter table. This is a small deterministic evaluation, **not an LLM accuracy benchmark**. No claim of general prompt-injection robustness or live AI success follows from it.

Other tests cover explicit approval, amount tampering, session isolation, expiry, merchant/category/stock denial, price changes, forged client status, repeated capture, buyer approval, quotas, invalid model JSON/SKUs and tool fields, OAuth caching, sandbox host enforcement, request IDs, timeout redaction and provider fallback.

Browser flow one uses the real local backend/database through the Next.js proxy for proposal → approval → audit/history. Flow two checks budget rejection and catalog comparison. Flow three explicitly replaces the external PayPal SDK and order response with fixtures to verify initiation and cancellation wiring; it never represents an actual payment.

Actual local screenshots are in `docs/screenshots/`; they display the labelled non-AI fallback and disabled checkout. Visual review included desktop/mobile layout and encoding. A browser regression assertion detects the encoding corruption found and fixed during development.

Initial failures: pytest reserved parameter name, Next link lint rule, Windows subprocess sandbox EPERM, and corrupted symbols identified visually. These were corrected; subprocess checks ran with approved escalation. No failed test result was substituted with a mock success claim.

Commands: `python -m pytest -q backend`; `python -m ruff format backend`; `python -m ruff check backend --select E9,F63,F7,F82`; frontend `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
