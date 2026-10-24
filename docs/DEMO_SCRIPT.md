# Demo recording plan — target 2:55, not recorded

Use the narration below only after the features shown have been genuinely verified. If AI or PayPal is unavailable, label the fallback and describe payment as unverified; do not present fixtures as live success.

| Time | Screen | Narration |
|---|---|---|
| 0:00–0:20 | Workspace title and request | “AI can help choose what to buy. But a recommendation should never silently become a payment. AgentPay Guard gives small teams a clear boundary between an assistant's suggestion and a person's authority to spend.” |
| 0:20–0:45 | Request, budget, quantity | “Describe what you need and set a binding budget. I need a quiet wireless keyboard for my home office, with an eighty-dollar maximum. This demonstration uses a controlled fictional catalog and PayPal sandbox. No real goods or money are involved.” |
| 0:45–1:15 | Generate proposal; show hosted AI label | “The model selects a catalog product. The server supplies its real catalog attributes and price, then checks the SKU, merchant, category, availability and budget. Here is the exact item, total and reason for the recommendation. The model has no payment tools.” |
| 1:15–1:40 | Budget $20 rejection, then restore $80 | “Let's lower the budget to twenty dollars. There is no eligible match, so the assistant asks us to adjust the request. It cannot invent a cheaper price or override the spending policy. Restoring the budget produces a proposal I can review.” |
| 1:40–2:20 | Explicit proposal approval and disabled checkout boundary | “I approve this exact product and amount. That records human intent; it is not a payment. Public order creation and capture are intentionally disabled. Separately, our genuine Sandbox evidence verified one buyer-approved 59-dollar order through a server-side PayPal lookup. It was never captured or presented as paid.” |
| 2:20–2:45 | History and audit | “The audit separates recommendation, policy checks and human approval. Each record belongs to this browser session. If Gemini fails, the interface explicitly labels the deterministic fallback as non-AI. Payment stages remain visibly distinct and locked in the public demo.” |
| 2:45–2:55 | Workspace closing | “AgentPay Guard makes assisted purchasing explainable and deliberate. AI proposes. Policy checks. You approve.” |

## Browser preparation

- Verify the hosted proposal workflow and displayed AI mode before recording. Refer to the genuine prior Sandbox approval as prior evidence; do not imply the public demo created that order, and do not include secrets or account email in footage.
- Use a clean browser profile, 1440×1000 viewport and readable zoom. Close unrelated tabs and notifications.
- Preload the app, confirm backend connectivity and sandbox buyer access; never show developer credential pages.
- Rehearse the exact script with a timer. Aim below 2:55; shorten pauses before cutting material facts.
- Record the actual flow, including any truthful pending state. Do not splice an unverified success into a failed checkout.
- Obtain authorization before public YouTube upload. Verify public visibility and final duration.

## Backup

If AI is unavailable, demonstrate the labelled non-AI fallback and disclose the limitation. If PayPal fails, show proposal/policy/audit and explain the checkout blocker. Use a previously recorded genuine sandbox run only if identified as a prior recording. Mocked automated tests demonstrate code paths, not successful integration.
