# Known limitations

- One hosted Gemini inference and one PayPal Sandbox buyer approval are genuinely verified. Broader hosted-model reliability and PayPal capture are not verified.
- Fictional fixed catalog, one merchant, USD only; no fulfillment, tax, shipping, discounts or refunds.
- Explicit numeric budget is authoritative. Natural-language budget extraction is not implemented; contradictory budgets in text need user review.
- Deterministic fallback is non-AI and deliberately narrow. It does not understand every preference or negation; it is not a substitute for the hackathon AI requirement.
- No webhook ingestion; pending transactions require manual status refresh. No durable background reconciliation.
- Anonymous per-tab sessions expire after 24 hours. No login, recovery or cross-device history.
- Session issuance and Gemini usage have shared database quotas across workers plus hashed per-client buckets. Accurate client-IP grouping requires verified trusted-proxy CIDRs; Vercel Firewall cannot protect direct Render requests.
- PostgreSQL 17.11 passed the disposable Alembic, restart, ownership and idempotency test. Neon connectivity and revision `20261018_0001` are hosted-verified; managed backup/restore and restart recovery are not.
- Capture IDs/receipts are absent because no capture occurred. External audit integrity needs expansion; UI history presently shows verified state and order ID.
- The public repository and deployment exist. The frontend and read-only health/readiness routes are reachable, but hosted session creation is blocked by Render's deployed exact-origin configuration. No recorded video or Devpost submission is verified.
