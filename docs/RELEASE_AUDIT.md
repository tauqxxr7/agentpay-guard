# Release audit

- [x] Local source, MIT license, setup, CI and documentation prepared.
- [x] Local proposal, approval, policy and audit workflow tested.
- [x] Actual desktop/mobile screenshots captured and reviewed.
- [x] Measured offline tests and build results documented.
- [x] Production npm audit reports zero known vulnerabilities after upgrading Next.js to 16.4.2.
- [x] One hosted Gemini inference independently verified; broader reliability remains partial.
- [x] Genuine PayPal sandbox OAuth and uncaptured order creation independently verified.
- [x] Genuine PayPal sandbox buyer approval independently verified.
- [ ] Genuine PayPal sandbox capture independently verified; zero captures occurred.
- [x] Disposable PostgreSQL migration, persistence, ownership and idempotency verified.
- [x] Hosted Neon connectivity and expected Alembic revision verified.
- [ ] Hosted backup/restore and restart recovery verified.
- [x] Public repository and visible license verified remotely.
- [ ] Fresh-machine reproducible setup independently verified.
- [x] Public non-payment workflow verified through the Vercel proxy: session, proposal, six policies, approval, owner-scoped history and refresh passed. Browser interaction on the new deployment remains to be independently checked.
- [ ] Public YouTube video below three minutes verified.
- [ ] Complete Devpost submission verified.

**Release decision: READY FOR MANUAL BROWSER RECORDING CHECK, NOT YET SUBMITTED.** The public non-payment API workflow, 20 CI browser tests, prior hosted Gemini sample, and prior Sandbox buyer approval have genuine evidence. The current hosted response used a labelled non-AI fallback. Hosted browser interaction could not be independently checked because the browser access host was unavailable. A public YouTube video, entrant eligibility review, and Devpost submission remain; this is not production certification.
