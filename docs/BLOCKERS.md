# Blockers and owner actions

1. **PayPal capture:** sandbox OAuth, order creation and genuine buyer approval are verified for one USD 59.00 order. Capture was not attempted, no capture is claimed, and `CAPTURE_ENABLED=false`. Credentials remain only in ignored `.env`.
2. **Hosted AI:** one genuine structured Gemini request is verified. The remaining hosted evaluation cases were blocked by 503/429 provider responses, so broader hosted-model reliability remains unverified.
3. **Hosted checkout flow:** the public frontend and backend are live, and `/ready` verifies Neon PostgreSQL at revision `20261018_0001`. The backend still rejects the exact production origin on `POST /sessions` with HTTP 403, so proposal, ownership, hosted Gemini and persistence checks are blocked until Render's `FRONTEND_ORIGIN` is corrected and the service restarted.
4. **Hosted persistence:** Neon connectivity and schema readiness are verified. Proposal persistence and recovery across a Render restart remain unverified; no destructive or operator restart was performed.
5. **Submission:** confirm entrant eligibility; resolve the hosted-origin blocker, record the actual functioning demo, approve public YouTube upload and complete Devpost entry. No video or submission has been verified.

These stop conditions follow the user's explicit operating principles and phases. Routine local implementation and verification did not require separate approval.
