# Blockers and owner actions

1. **PayPal capture:** sandbox OAuth, order creation and genuine buyer approval are verified for one USD 59.00 order. Capture was not attempted, no capture is claimed, and `CAPTURE_ENABLED=false`. Credentials remain only in ignored `.env`.
2. **Hosted AI:** one genuine structured Gemini request is verified. The remaining hosted evaluation cases were blocked by 503/429 provider responses, so broader hosted-model reliability remains unverified.
3. **Hosted Gemini:** after the timeout fix deployed, the full non-payment proposal/approval/history flow passed on November 11, but that response was labelled deterministic fallback (non-AI; Gemini unavailable). The prior genuine hosted Gemini response remains valid evidence; current hosted Gemini availability has not been re-established.
4. **Hosted persistence:** Neon connectivity and schema readiness are verified. Proposal persistence and recovery across a Render restart remain unverified; no destructive or operator restart was performed.
5. **Submission:** confirm entrant eligibility, record the actual functioning hosted demo, upload it publicly to YouTube, and complete Devpost. No video or submission has been verified.

These stop conditions follow the user's explicit operating principles and phases. Routine local implementation and verification did not require separate approval.
