# Gemini AI integration

AgentPay Guard uses the official `google-genai` Python SDK. The backend reads `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and `GEMINI_MODEL` from its environment. The key is server-only and must remain in ignored `.env` locally or a backend secret store when deployed.

The default alias is `gemini-flash-latest`. Google documents `latest` aliases as moving targets, so genuine evaluation records both the requested alias and the response's resolved `model_version`. A stable model identifier should replace the alias before production use.

The request contains only the user's purchase text, explicit budget in cents, quantity, and controlled catalog. It defines no tools. Gemini has no order, capture, credential, or database access. Product and user fields are explicitly marked untrusted.

Gemini native structured output receives the supported subset of the existing strict Pydantic `Intent` JSON Schema. Gemini does not accept Pydantic's `additionalProperties` keyword, so that keyword is removed only from the provider schema; the backend still validates the response with the original `extra="forbid"` Pydantic model. It then resolves any SKU against the catalog and deterministically checks merchant, category, stock, budget, quantity, and current price. Model output never supplies an authoritative price or payment state.

HTTP behavior is bounded to three attempts for 408, 429, and selected 5xx responses, with exponential backoff, jitter, a two-second maximum delay, and a 25-second per-request timeout. Thinking is disabled for this narrow classification task and output is capped at 500 tokens. Invalid, empty, schema-failing, or policy-failing output is labelled `deterministic fallback (non-AI; Gemini output rejected)`. Provider failures use `deterministic fallback (non-AI; Gemini unavailable)`. Missing configuration is labelled separately. Errors and credentials are not returned to clients.

`backend/scripts/evaluate_gemini.py` performs the explicit hosted check, model lookup, five safety and quality cases, latency measurement, token-usage collection where supplied, schema validation, and deterministic policy evaluation. It never prints the API key. This evaluation is separate from the 60 deterministic fallback scenarios.
