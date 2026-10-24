# Devpost draft — not submitted

## AgentPay Guard

AI-powered purchasing with verifiable decisions, policy-controlled spending, and PayPal checkout.

## Inspiration

Small teams need purchasing help without giving an AI unrestricted spending authority. A useful assistant should explain its choice, respect explicit limits, and leave payment approval with a person.

## What it does

AgentPay Guard interprets a purchasing request, recommends from a controlled demo catalog, and shows the exact product, amount, rationale and policy outcomes. Users review and approve the proposal before PayPal Sandbox checkout. Transaction history separates recommendation, human approval, order creation and server-verified buyer approval. It does not present an approved but uncaptured order as paid.

## How it is built

Next.js, TypeScript and Tailwind provide the responsive interface. FastAPI, Pydantic and SQLAlchemy own validation, sessions and PostgreSQL/SQLite persistence. A hosted Gemini adapter uses native Pydantic structured output for a constrained SKU selection; deterministic server code checks budget, merchant, category, availability and price. PayPal Orders API and the official JavaScript checkout handle buyer approval. The backend verifies approval directly with PayPal before changing application state. Capture remains separately disabled and unverified.

## What makes it different

The important boundary is explicit: the model can propose a product, but has no payment tool. Explanations use catalog attributes and the audit identifies each decision stage. Provider outages produce an honestly labelled fallback, not simulated AI or fake payments.

## Challenges and learning

Payment callbacks are not authoritative receipts. Idempotent requests and server reconciliation are necessary when a network timeout leaves an outcome uncertain. Model output also needs validation before it enters an approval workflow.

## Evidence and limitations

One genuine Gemini request returned schema-valid grounded output; later hosted cases received 429/503 responses. One genuine USD 59.00 PayPal Sandbox order reached `APPROVED` and the backend reached `BUYER_APPROVED` after server verification. Zero captures occurred. Neon connectivity and the expected schema revision are verified, but the hosted proposal flow is currently blocked by an exact-origin configuration mismatch. Catalog inventory is fictional; no live payments or goods are fulfilled.

## Submission checklist

- [ ] Confirm entrant eligibility and join the hackathon.
- [x] Verify one hosted AI inference with a genuine provider response.
- [x] Verify genuine PayPal Sandbox buyer approval.
- [ ] Keep capture described as unverified unless a separately authorized test occurs.
- [x] Publish public repository with MIT license, source, assets and setup.
- [ ] Verify judge access to the complete hosted workflow after correcting Render's exact origin.
- [x] Capture actual production UI screenshots.
- [ ] Record, authorize upload and verify public YouTube video shorter than three minutes.
- [ ] Enter actual repository/video/demo links and technologies in Devpost.
- [ ] Review all claims and submit before November 13, 2026, 01:30 IST.

Repository URL: https://github.com/tauqxxr7/agentpay-guard. Demo URL: https://agentpay-guard-nine.vercel.app (public shell and read-only readiness verified; proposal flow currently blocked by origin configuration). YouTube URL: not recorded/uploaded. Do not submit placeholders.
