# AgentPay Guard demo — target 2:55

**Recording status:** Not recorded or uploaded. Rehearse using the actual hosted app. Do not present a fallback as Gemini or a buyer-approved order as paid.

| Time | Screen and action | Narration |
|---|---|---|
| 0:00–0:20 | Command center | “AI can help us choose what to buy, but it should never silently spend. AgentPay Guard separates a recommendation from policy checks and human authorization.” |
| 0:20–0:50 | Studio request | “I'll request a quiet wireless keyboard for my desk, set an eighty-dollar budget, and choose quantity one. This uses a fictional demo catalog.” |
| 0:50–1:20 | Result and mode | “The assistant recommends a catalog SKU. The backend supplies the actual catalog price and attributes. Here the Studio Keyboard is fifty-nine dollars. The mode label tells us whether Gemini answered or a deterministic non-AI fallback was used.” |
| 1:20–1:50 | Policy panel | “Six server-side checks cover SKU, merchant, category, stock, budget, and unchanged price. The model cannot change the price or call a payment tool.” |
| 1:50–2:10 | Approval | “I approve this exact proposal. This records my decision; it does not create or capture a payment in the public demo.” |
| 2:10–2:30 | History and audit | “History shows the proposal and human approval as separate events. Another browser session cannot read this one’s records.” |
| 2:30–2:45 | Documentation or redacted prior evidence | “Separately, a genuine PayPal Sandbox buyer approved a fifty-nine-dollar order. The server verified PayPal's APPROVED state. No capture occurred; public checkout is disabled.” |
| 2:45–2:55 | Architecture | “The boundary is simple: AI proposes, deterministic policy checks, and a person approves.” |

## Before recording

1. Confirm [hosted readiness](https://agentpay-guard-api.onrender.com/ready) and that the public session/proposal/approval/history path currently works. Allow free-tier cold starts. If it fails, record a clearly labelled local run instead.
2. Inspect the provider label on the actual result. Say “Gemini” only if it says `Gemini`; otherwise explain the labelled non-AI fallback. Do not splice in a prior Gemini response as a current hosted result.
3. Use a clean browser profile at about 1440 px width, hide notifications and account details, and prepare the exact request. Do not display tokens, credentials, dashboard secrets, or buyer information.
4. For PayPal, show only redacted, previously verified evidence or a real prior recording clearly identified as such. Do not suggest an uncaptured order is paid.
5. Rehearse to under three minutes. Record the functioning app, verify video duration, upload publicly to YouTube, and add its actual link to [the Devpost draft](DEVPOST_FINAL.md).

## Honest backup

If hosted Gemini is unavailable, show the labelled deterministic fallback and say the prior genuine Gemini test is separate. If the hosted proposal path is unavailable, run the documented local setup and explicitly identify it as local. Never recreate a Sandbox approval with mock data or imply that Playwright's mocked PayPal callbacks are a real transaction.
