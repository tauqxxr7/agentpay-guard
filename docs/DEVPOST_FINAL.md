# AgentPay Guard — Devpost submission draft

**Status:** Prepared for review. Not submitted. Replace the video placeholder only after a public YouTube upload is verified.

## Elevator pitch

An AI assistant can recommend a purchase, but deterministic spending policies and a person decide whether it proceeds to PayPal Sandbox checkout.

## Inspiration

Small teams need purchasing help without giving an AI unrestricted authority to spend. The hard part is making every recommendation explainable, checking the actual price and merchant, and keeping human approval separate from payment.

## What it does

AgentPay Guard interprets a shopping request with an explicit USD budget and quantity. Gemini can suggest a SKU from a controlled fictional catalog. The backend validates that SKU against trusted product data, computes the real catalog price, and runs six deterministic checks: valid SKU, approved merchant, allowed category, stock, budget, and unchanged price. A person reviews and approves the exact proposal. History records the proposal and approval events for that browser session.

The code also integrates PayPal Sandbox OAuth, Orders API, and the official JavaScript SDK. In a separately verified Sandbox run, a USD 59.00 order reached PayPal `APPROVED`. The backend retrieved the order, checked identity, merchant, amount and currency, then recorded `BUYER_APPROVED` once. No capture occurred. Public order creation and capture are deliberately disabled for the judge demo.

## How we built it

Next.js, React, TypeScript, and Tailwind CSS provide the responsive interface. FastAPI, Pydantic, SQLAlchemy, Alembic, and Neon PostgreSQL handle validation, persistence, session ownership, audit, and shared quotas. The official Google Gen AI SDK requests native structured output from Gemini. Backend Pydantic validation and catalog/policy code remain authoritative. PayPal checkout uses the Sandbox Orders API and JavaScript SDK; callbacks trigger server-side verification rather than declaring payment success.

## Challenges

Checkout failures can leave a valid order awaiting buyer approval, so the app uses stable request IDs, owner-scoped recovery, and read-only reconciliation. Hosted free-tier cold starts, model quota errors, and exact Origin settings also required careful error handling. The model's fluent output cannot be trusted for prices or authorization.

## Accomplishments and learning

We verified one genuine hosted Gemini response with structured, grounded output and one genuine PayPal Sandbox buyer approval without capture. Automated tests cover policy tampering, ownership, retries, recovery, migrations, and mocked checkout callbacks. We learned to treat AI output and browser callbacks as inputs for server verification, not as authoritative financial facts.

## What's next

Add durable background payment reconciliation, verified webhook ingestion, stronger authenticated accounts, real merchant inventory, and production-grade operational controls. Capture, fulfillment, refunds, and real-money payments are outside this hackathon demo.

## Technologies used

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Python 3.11, FastAPI, Pydantic, Google Gemini (`google-genai`), PayPal Sandbox Orders API and JavaScript SDK, SQLAlchemy, Alembic, Neon PostgreSQL, SQLite, Render, Vercel, pytest, Ruff, ESLint, Playwright, GitHub Actions.

## Judge testing

1. Open [the hosted demo](https://agentpay-guard-nine.vercel.app). Allow a sleeping free-tier backend to wake. Recheck the complete hosted proposal flow before advertising it as functional; use the reproducible local setup if the timeout remains.
2. Request a quiet wireless keyboard with a USD 80 budget and quantity 1. Inspect the mode label. `Gemini` means a hosted response was received; `deterministic fallback (non-AI; …)` means it was not.
3. Review the catalog-backed USD 59 price and six checks, explicitly approve, then open History for the audit. Public PayPal checkout remains disabled.
4. To reproduce locally, use the commands in the [README](../README.md). Sandbox buyer checkout requires separately configured developer credentials; do not use live credentials.

The repository contains a [PayPal integration explanation](PAYPAL_INTEGRATION.md), [AI integration explanation](AI_INTEGRATION.md), [evaluation](EVALUATION.md), [limitations](KNOWN_LIMITATIONS.md), and [MIT license](../LICENSE). A real Sandbox approval is documented, but it is not a public paid transaction. No hosted Gemini success should be inferred from a fallback result.

## Links

- Source: https://github.com/tauqxxr7/agentpay-guard
- Hosted demo: https://agentpay-guard-nine.vercel.app
- CI: https://github.com/tauqxxr7/agentpay-guard/actions/workflows/ci.yml
- Public YouTube video: **required — record, upload, and insert actual URL before submission**

## Demonstration video script

Use the timed [narration and recording checklist](DEMO_SCRIPT.md). Show live non-payment proposal/approval/audit behavior; identify the PayPal buyer approval as prior verified Sandbox evidence. Do not imply public checkout or capture succeeded.

## Submission checklist

- [x] Public source repository, code, setup instructions, and MIT license
- [x] PayPal Sandbox and Gemini integrations implemented; genuine milestones recorded
- [ ] Recheck hosted proposal flow and mode immediately before recording
- [ ] Record a genuine product walkthrough under three minutes
- [ ] Upload to public YouTube and verify URL/duration
- [ ] Confirm personal eligibility and hackathon-period work against [official rules](https://paypalaihackathon.devpost.com/rules)
- [ ] Paste accurate text, links, technologies, and testing access into Devpost; submit before the official deadline

Do not invent project creation dates or eligibility facts. The official deadline shown by Devpost is **November 12, 2026, 12:00 PST** (November 13, 01:30 IST).
