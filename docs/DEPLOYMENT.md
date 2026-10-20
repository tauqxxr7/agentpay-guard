# Minimum-cost public demo deployment

This runbook targets Vercel Hobby for the Next.js frontend, Render Free for one FastAPI process, and Neon Free for PostgreSQL. It does not enable PayPal order creation or capture. Local SQLite data and historical Sandbox records must not be copied to Neon.

## 1. Create and migrate Neon manually

Create a Neon project and keep its region close to the Render service. Copy the **direct** connection string for migration work and confirm it contains `sslmode=require`. Store it only in the ignored local `.env`; never put it in a command argument, commit, screenshot, or chat.

From `backend/` in PowerShell, load the secret into the current process without printing it, then run:

```powershell
python -m alembic upgrade head
python -m alembic current
python -m alembic check
```

Expected revision: `20261018_0001 (head)` and `No new upgrade operations detected`. Query `SELECT version_num FROM alembic_version;` in the Neon SQL Editor as a second check. Use the direct endpoint for migrations so transaction/session behavior is not constrained by PgBouncer. Use Neon's pooled connection string for the long-running Render application if available; keep the SQLAlchemy pool small (`3 + 2` overflow) because both Neon and Render can cold-start. Both URLs must use TLS.

Apply migrations manually before the first Render deployment. For future schema releases: stop automatic deployment, run and verify the migration from a trusted local environment against the direct endpoint, then deploy the compatible application. Prefer additive/backward-compatible migrations. The initial downgrade deletes all application tables, so never use it as a rollback for retained data.

## 2. Configure Render Free

Create the service from `render.yaml` or manually with:

- Runtime: Python
- Python: `3.11.11`, pinned through both `PYTHON_VERSION` and `backend/.python-version`
- Plan: Free
- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --no-proxy-headers`
- Health check: `/health`

The Blueprint intentionally has no Render database and no `preDeployCommand`. Set these variables in the Render dashboard:

| Variable | Value / handling |
|---|---|
| `DATABASE_URL` | Secret Neon pooled PostgreSQL URL with `sslmode=require` |
| `APP_ENV` | `production` |
| `PYTHON_VERSION` | `3.11.11`; keep aligned with `backend/.python-version` and CI |
| `FRONTEND_ORIGIN` | Exact Vercel HTTPS origin; comma-separated exact origins only if Preview is required |
| `ALLOWED_HOSTS` | Exact Render hostname and, if observed in proxied requests, the Vercel hostname; no schemes or paths |
| `PAYMENTS_ENABLED` | `false` |
| `CAPTURE_ENABLED` | `false` |
| `AI_PROVIDER` | `gemini` |
| `GEMINI_API_KEY` | Secret |
| `GEMINI_MODEL` | `gemini-flash-latest` |
| `SESSION_CREATION_LIMIT_PER_MINUTE` | `20` global backstop |
| `CLIENT_SESSION_LIMIT_PER_MINUTE` | `5` |
| `CLIENT_PROPOSAL_LIMIT_PER_MINUTE` | `10` |
| `GEMINI_REQUESTS_PER_HOUR` | `20` global fail-closed quota |
| `DATABASE_POOL_SIZE` | `3` |
| `DATABASE_MAX_OVERFLOW` | `2` |
| `TRUSTED_PROXY_CIDRS` | Empty until the actual immediate proxy CIDRs are verified |

PayPal credentials and `PAYPAL_MERCHANT_ID` may remain unset while payments are disabled. Never configure live credentials. Production startup rejects missing `DATABASE_URL`, SQLite, and PostgreSQL URLs without TLS. `/ready` returns 503 unless the database is reachable and `alembic_version` is exactly the expected revision. `/health` stays independent of dependencies so Render can distinguish a live process from database readiness.

The exact Python pin prevents Render from selecting its newer default runtime. `pydantic==2.10.4` resolves to `pydantic-core==2.27.2`, which publishes a CPython 3.11 manylinux x86-64 wheel; the Render build must download that wheel rather than invoke maturin/Rust. CI runs the backend suite on the same Python patch and a regression test requires all three pins to remain aligned.

Render Free services spin down after inactivity, so the first request can be slow. The frontend waits up to 45 seconds and gives a retry message for 502/503/504 responses. Neon can also scale compute to zero; a simultaneous Render and Neon wake-up can add latency. Free tiers have usage, storage, retention, and support limits and should be treated as hackathon-demo infrastructure rather than durable production hosting.

## 3. Configure Vercel Hobby

Import the repository and set Root Directory to `frontend`. Framework detection should select Next.js. Add only:

```text
BACKEND_URL=https://<exact-render-service>.onrender.com
```

`BACKEND_URL` is server-only and must not use a `NEXT_PUBLIC_` prefix. Gemini, PayPal, and database credentials belong only on Render. A Vercel build fails if `BACKEND_URL` is absent or non-HTTPS. The `/api/:path*` rewrite keeps browser calls same-origin.

The production CSP permits this application's own scripts plus the official PayPal SDK, PayPal frames, images, forms, and connections. `unsafe-eval` is development-only. `unsafe-inline` remains for Next.js/PayPal compatibility and should be replaced with nonces in a later hardening pass.

## 4. Abuse controls and network boundaries

Database-backed global quotas work across workers and cannot be reset by rotating browser sessions. Per-client database buckets add another limit. Uvicorn proxy-header rewriting is disabled so the application can validate the immediate peer itself. It ignores `X-Forwarded-For` unless that peer belongs to an explicitly configured `TRUSTED_PROXY_CIDRS` network; do not guess these CIDRs. Without verified proxy metadata, it safely groups by the direct peer, which may be coarse behind a proxy.

Vercel Firewall rules can protect `/api/sessions` and `/api/proposals` on the Vercel hostname, but they do not protect the directly accessible `onrender.com` hostname. Keep the backend limits enabled. CORS and the production Origin/Host checks reduce browser abuse and routing mistakes; they are not authentication because non-browser clients can forge headers. Anonymous bearer ownership, deterministic policy gates, global quotas, and disabled payments remain the security boundaries.

Expired quota buckets are removed during quota use. Expired sessions are removed only when they own no proposals, so transaction history is not deleted. Gemini quota exhaustion returns 429 before provider invocation and never silently falls back for that request.

## 5. Safe hosted smoke test

After the user authorizes deployment:

1. Confirm the manual Neon migration and exact revision.
2. Open Render `/health`; expect `status=ok` and `environment=sandbox`.
3. Open Render `/ready`; expect PostgreSQL, the expected schema revision, and sanitized provider configuration states. It performs no PayPal or Gemini network call and exposes no secrets.
4. Open the Vercel URL after allowing for a cold start.
5. Submit one catalog recommendation, verify deterministic policies, approve the proposal, open History, and confirm it persists after a Render restart.
6. Confirm the UI says Sandbox checkout is disabled.
7. Review Render logs for sanitized error types only. Do not expect request bodies, bearer tokens, database URLs, or provider secrets.

Manual dashboard access is required to create Neon, paste `DATABASE_URL`, create/configure Render, set the exact Render hostname, import/configure Vercel, and inspect provider usage. Creating any PayPal Sandbox order still requires separate authorization.
