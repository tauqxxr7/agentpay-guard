# Blockers and owner actions

1. **PayPal buyer checkout/capture:** sandbox OAuth and one uncaptured order are verified. A separate personal sandbox buyer and explicit owner approval are still required before capture testing. Credentials remain only in ignored `.env`.
2. **Hosted AI:** configure `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` locally in ignored `.env`. The recommended fast model is `claude-haiku-5-5`, subject to API workspace access. Genuine inference, latency, model identity and hosted evaluation remain unverified.
3. **Sandbox payment approval:** owner must explicitly authorize testing and approve in the PayPal buyer popup. No autonomous transaction will be performed.
4. **Repository access:** GitHub returned Repository not found for the requested URL. Owner must confirm/create the repository and authorize public publishing. Local commits do not publish it.
5. **PostgreSQL:** `DATABASE_URL` still selects SQLite; no local PostgreSQL client or Docker runtime is available. A genuine PostgreSQL URL/service is required to verify schema creation, transaction history and restart recovery.
6. **Deployment:** public deployment/account changes require owner authorization. IP/edge session-abuse protection and provider quotas remain prerequisites.
7. **Submission:** confirm entrant eligibility; record actual functioning demo, approve public YouTube upload and complete Devpost entry. No video/submission was created externally.

These stop conditions follow the user's explicit operating principles and phases. Routine local implementation and verification did not require separate approval.
