# Security boundaries

Threats: malicious purchase text/catalog data, fabricated model SKUs, price tampering, order replay, forged callback status, cross-session access and credential leakage.

Controls: strict input schemas, server-owned prices/merchant policy, no model tools, validated model output, deterministic policy gates, 30-minute proposal expiry, 24-hour random bearer sessions, hashed stored tokens, per-session request caps, database-backed shared session/Gemini quotas, server-only credentials, sandbox-only endpoint, explicit approval, buyer approval verified through PayPal, stable idempotency keys, PostgreSQL row locks and redacted audit events.

Requests use explicit Authorization headers rather than ambient cookies, so cross-site forms cannot authenticate payment mutations. CORS permits only FRONTEND_ORIGIN; the frontend uses a same-origin Next.js proxy. SessionStorage is vulnerable to successful XSS: never render untrusted HTML. React renders catalog/model-derived text as text. No card data is collected.

Prompt-injection keyword rejection is defense in depth, not a complete detector. The core boundary is the model's lack of payment capabilities and subsequent policy validation. Free-form preferences may still be misunderstood by AI; the exact product and amount require human review.

Known deployment gaps: the shared database quota prevents browser-session rotation from resetting capacity, but an edge/IP limit is still recommended for fair per-client allocation and denial-of-service resistance. SQLite concurrency is limited. No independent immutable audit store or automated repository secret scanner exists. The frontend CSP is intentionally compatible with PayPal's SDK and must be browser-verified after deployment. This is not certified or production-ready payment infrastructure.
