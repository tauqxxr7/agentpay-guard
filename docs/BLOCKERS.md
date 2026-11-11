# Blockers and owner actions

1. **PayPal capture:** sandbox OAuth, order creation and genuine buyer approval are verified for one USD 59.00 order. Capture was not attempted, no capture is claimed, and `CAPTURE_ENABLED=false`. Credentials remain only in ignored `.env`.
2. **Hosted AI:** one genuine structured Gemini request is verified. The remaining hosted evaluation cases were blocked by 503/429 provider responses, so broader hosted-model reliability remains unverified.
3. **Hosted non-payment flow:** the public frontend and backend are live, `/ready` verifies Neon PostgreSQL at revision `20261018_0001`, and exact-origin `POST /sessions` now returns HTTP 200. A November 11 proposal request timed out after 65 seconds; the deployed Gemini retry window could exceed the frontend deadline. The local timeout fix requires CI, deployment, and a fresh hosted workflow test before proposal/approval/history can be called verified.
4. **Hosted persistence:** Neon connectivity and schema readiness are verified. Proposal persistence and recovery across a Render restart remain unverified; no destructive or operator restart was performed.
5. **Submission:** confirm entrant eligibility; verify the hosted proposal flow after the timeout fix, record the actual functioning demo, upload it publicly to YouTube, and complete Devpost. No video or submission has been verified.

These stop conditions follow the user's explicit operating principles and phases. Routine local implementation and verification did not require separate approval.
