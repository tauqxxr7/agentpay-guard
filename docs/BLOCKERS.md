# Blockers and owner actions

1. **PayPal capture:** sandbox OAuth, order creation and genuine buyer approval are verified for one USD 59.00 order. Capture was not attempted, no capture is claimed, and `CAPTURE_ENABLED=false`. Credentials remain only in ignored `.env`.
2. **Hosted AI:** one genuine structured Gemini request is verified. The remaining hosted evaluation cases were blocked by 503/429 provider responses, so broader hosted-model reliability remains unverified.
3. **PostgreSQL:** `DATABASE_URL` still selects SQLite; no local PostgreSQL client or Docker runtime is available. A genuine PostgreSQL URL/service is required to verify schema creation, transaction history and restart recovery. Versioned database migrations are not yet implemented.
4. **Deployment:** no public deployment is verified. IP/edge session-abuse protection, provider quotas, PostgreSQL and hosted connectivity checks remain prerequisites.
5. **Submission:** confirm entrant eligibility; record the actual functioning demo, approve public YouTube upload and complete Devpost entry. No video or submission has been verified.

These stop conditions follow the user's explicit operating principles and phases. Routine local implementation and verification did not require separate approval.
