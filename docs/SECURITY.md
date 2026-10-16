# Security boundaries

Threats: malicious purchase text/catalog data, fabricated model SKUs, price tampering, order replay, forged callback status, cross-session access and credential leakage.

Controls: strict input schemas, server-owned prices/merchant policy, no model tools, validated model output, deterministic policy gates, 30-minute proposal expiry, 24-hour random bearer sessions, hashed stored tokens, per-session request cap, server-only credentials, sandbox-only endpoint, explicit approval, buyer approval verified through PayPal, stable idempotency keys, PostgreSQL row locks and redacted audit events.

Requests use explicit Authorization headers rather than ambient cookies, so cross-site forms cannot authenticate payment mutations. CORS permits only FRONTEND_ORIGIN; the frontend uses a same-origin Next.js proxy. SessionStorage is vulnerable to successful XSS: never render untrusted HTML. React renders catalog/model-derived text as text. No card data is collected.

Prompt-injection keyword rejection is defense in depth, not a complete detector. The core boundary is the model's lack of payment capabilities and subsequent policy validation. Free-form preferences may still be misunderstood by AI; the exact product and amount require human review.

Known deployment gaps: unauthenticated session creation needs edge/IP abuse protection before public access; a session cap alone is not sufficient against repeated session creation. SQLite concurrency is limited. No independent immutable audit store, database migrations, automated secret scanner, distributed quota or full Content Security Policy yet. This is not certified or production-ready payment infrastructure.
