# Known limitations

- Real AI inference and real PayPal sandbox checkout unverified without owner credentials/approval.
- Fictional fixed catalog, one merchant, USD only; no fulfillment, tax, shipping, discounts or refunds.
- Explicit numeric budget is authoritative. Natural-language budget extraction is not implemented; contradictory budgets in text need user review.
- Deterministic fallback is non-AI and deliberately narrow. It does not understand every preference or negation; it is not a substitute for the hackathon AI requirement.
- No webhook ingestion; pending transactions require manual status refresh. No durable background reconciliation.
- Anonymous per-tab sessions expire after 24 hours. No login, recovery or cross-device history.
- Session issuance lacks IP/edge rate limiting. Deployment must address abuse before public exposure.
- PostgreSQL driver/config supported, but real PostgreSQL integration not yet tested. Initial schema creation is not a migration system.
- Capture IDs/receipts and external audit integrity need expansion. UI history presently shows verified state and order ID.
- No public repository, deployment, recorded video or Devpost submission verified.
