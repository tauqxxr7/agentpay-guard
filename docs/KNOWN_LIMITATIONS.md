# Known limitations

- One hosted Gemini inference and one PayPal Sandbox buyer approval are genuinely verified. Broader hosted-model reliability and PayPal capture are not verified.
- Fictional fixed catalog, one merchant, USD only; no fulfillment, tax, shipping, discounts or refunds.
- Explicit numeric budget is authoritative. Natural-language budget extraction is not implemented; contradictory budgets in text need user review.
- Deterministic fallback is non-AI and deliberately narrow. It does not understand every preference or negation; it is not a substitute for the hackathon AI requirement.
- No webhook ingestion; pending transactions require manual status refresh. No durable background reconciliation.
- Anonymous per-tab sessions expire after 24 hours. No login, recovery or cross-device history.
- Session issuance lacks IP/edge rate limiting. Deployment must address abuse before public exposure.
- PostgreSQL driver/config supported, but real PostgreSQL integration not yet tested. Initial schema creation is not a migration system.
- Capture IDs/receipts are absent because no capture occurred. External audit integrity needs expansion; UI history presently shows verified state and order ID.
- The public repository exists. No public deployment, recorded video or Devpost submission is verified.
