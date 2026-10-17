# AgentPay Guard

AI-powered purchasing with verifiable decisions, policy-controlled spending, and PayPal checkout.

An assistant can suggest a purchase; it should not silently spend your money. AgentPay Guard turns a request into a catalog-grounded proposal, checks deterministic policies, records your approval, and initiates PayPal sandbox checkout.

**Status:** local implementation; one genuine Gemini request and PayPal Sandbox OAuth/order creation are verified. Buyer checkout, capture, PostgreSQL, deployment, and public publishing remain pending. Fictional inventory, no fulfillment, sandbox only.

## Features

- Natural-language requests, explicit USD budget, quantity, catalog comparison.
- Hosted Gemini adapter with native Pydantic structured output; clearly labelled deterministic non-AI fallback.
- Server checks SKU, merchant, category, availability, budget and price changes.
- Explicit approval before official PayPal checkout; server-verified capture status.
- Isolated session history and timestamped decision audit.
- Responsive workspace, failure/empty states and judge demo guide.

## Local setup — Windows PowerShell

Requires Python 3.12+, Node 22+, npm, and Chrome for browser tests.

```powershell
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend/requirements.txt
cd backend
..\.venv\Scripts\python -m uvicorn app.main:app --env-file ../.env --port 8000
```

In a second terminal from repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:3000. Without credentials, the fallback recommendation, policies, approval and audit work; checkout is disabled. Root `.env` is ignored. Configure secrets locally, never in chat, screenshots or commits.

For hosted AI set `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and `GEMINI_MODEL=gemini-flash-latest` in ignored `.env`. The API resolves the alias to an actual model version during explicit evaluation. For PayPal follow [sandbox setup](docs/PAYPAL_INTEGRATION.md). `PAYMENTS_ENABLED` permits sandbox order creation; the separate server-only `CAPTURE_ENABLED` gate must also be explicitly enabled before capture. PostgreSQL uses `DATABASE_URL=postgresql+psycopg://...`; SQLite is the local default.

## Validation

```powershell
cd backend
..\.venv\Scripts\python -m pytest -q
cd ../frontend
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests start the backend using `python`; activate the virtual environment first if dependencies are not installed globally. Do not set payment or AI credentials for offline tests. See [evaluation](docs/EVALUATION.md) for actual results and test boundaries.

## Architecture and trust

Actual local UI (non-AI fallback; sandbox checkout disabled):

![AgentPay Guard desktop workspace](docs/screenshots/workspace-desktop.png)

[Mobile screenshot](docs/screenshots/workspace-mobile.png)

```mermaid
flowchart LR
  UI[Next.js] --> API[FastAPI]
  API --> AI[Hosted AI / labelled fallback]
  AI --> Policy[Deterministic policy]
  Policy --> DB[(SQLAlchemy)]
  UI --> Human[Explicit approval]
  Human --> API
  API --> PayPal[PayPal sandbox]
  PayPal --> Verify[Server capture verification]
  Verify --> DB
```

Stack: Next.js, React, TypeScript, Tailwind, FastAPI, Pydantic, SQLAlchemy, PostgreSQL/SQLite, pytest, Playwright, PayPal Orders/JavaScript SDK and the Google Gen AI SDK.

The model cannot call payment tools. Client callbacks cannot mark a payment complete. No live PayPal endpoint is configurable. This is a hackathon build, not production-certified financial infrastructure.

Read [feasibility](docs/FEASIBILITY.md), [architecture](docs/ARCHITECTURE.md), [security](docs/SECURITY.md), [limitations](docs/KNOWN_LIMITATIONS.md), [deployment](docs/DEPLOYMENT.md), [progress](docs/PROGRESS.md), and [blockers](docs/BLOCKERS.md).

License: [MIT](LICENSE).
