# Devpost draft — not submitted

## AgentPay Guard

AI-powered purchasing with verifiable decisions, policy-controlled spending, and PayPal checkout.

## Inspiration

Small teams need purchasing help without giving an AI unrestricted spending authority. A useful assistant should explain its choice, respect explicit limits, and leave payment approval with a person.

## What it does

AgentPay Guard interprets a purchasing request, recommends from a controlled demo catalog, and shows the exact product, amount, rationale and policy outcomes. Users review and approve the proposal before PayPal sandbox checkout. Transaction history separates a recommendation from an approved order and verified payment.

## How it is built

Next.js, TypeScript and Tailwind provide the responsive interface. FastAPI, Pydantic and SQLAlchemy own validation, sessions and persistence. A hosted Gemini adapter uses native Pydantic structured output for a constrained SKU selection; deterministic server code checks budget, merchant, category, availability and price. PayPal Orders API and the official JavaScript checkout handle buyer approval. The backend verifies capture status independently.

## What makes it different

The important boundary is explicit: the model can propose a product, but has no payment tool. Explanations use catalog attributes and the audit identifies each decision stage. Provider outages produce an honestly labelled fallback, not simulated AI or fake payments.

## Challenges and learning

Payment callbacks are not authoritative receipts. Idempotent requests and server reconciliation are necessary when a network timeout leaves an outcome uncertain. Model output also needs validation before it enters an approval workflow.

## Evidence and limitations

Insert only final measured results from EVALUATION.md. Current real AI/PayPal verification is pending; do not claim a completed integration demo until recorded evidence exists. Catalog inventory is fictional; no live payments or goods are fulfilled.

## Submission checklist

- [ ] Confirm entrant eligibility and join the hackathon.
- [ ] Verify hosted AI inference with genuine provider response.
- [ ] Verify genuine PayPal sandbox checkout and capture.
- [ ] Publish public repository with MIT license, source, assets and setup after owner approval.
- [ ] Verify judge access to reproducible build or actual hosted demo.
- [ ] Capture actual UI screenshots.
- [ ] Record, authorize upload and verify public YouTube video shorter than three minutes.
- [ ] Enter actual repository/video/demo links and technologies in Devpost.
- [ ] Review all claims and submit before November 13, 2026, 01:30 IST.

Repository URL: not verified public. Demo URL: not deployed. YouTube URL: not recorded/uploaded. Do not submit placeholders.
