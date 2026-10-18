# Deployment preparation — not deployed

Frontend target: Vercel, project root `frontend`, build `npm run build`. Set server-only `BACKEND_URL` to the eventual HTTPS backend URL. Rewrites are built from that variable; rebuild when changing it. Do not put provider secrets in NEXT_PUBLIC variables.

Vercel environment requirement: `BACKEND_URL` as a non-secret Config value scoped separately for Preview and Production. PayPal, AI, and database secrets belong only on the Render backend; they must never be configured in the frontend project.

Backend target: Render Python web service, project root `backend`, build `pip install -r requirements.txt`, pre-deploy `alembic upgrade head`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, liveness path `/health`, and database readiness path `/ready`.

Render pre-deploy commands require a paid web-service plan. Keep the Blueprint pre-deploy step for fail-safe migrations and select a compatible paid plan when provisioning. If a free web service is deliberately chosen instead, move `alembic upgrade head` into the build command as Render documents and accept the weaker deployment sequencing; do not start the application against an unmigrated database.

The Render Blueprint provisions managed PostgreSQL and injects its private connection string. Set `FRONTEND_ORIGIN` to the exact HTTPS Vercel origin and `PAYPAL_MERCHANT_ID` to the Sandbox Business merchant ID. Configure PayPal and Gemini credentials through Render secret settings. Use one worker initially. `PAYMENTS_ENABLED=false` and `CAPTURE_ENABLED=false` are committed safe defaults. Database-backed quotas default to 30 session creations per minute globally and 30 hosted Gemini requests per hour globally; tune them deliberately for the demo.

Before public deployment, verify the PostgreSQL migration and backup policy, provider quotas, HTTPS, exact-origin CORS, CSP/PayPal SDK behavior, session isolation, and outbound access to Gemini and PayPal Sandbox. The shared database quotas cannot be bypassed by rotating browser sessions and work across workers; an edge/IP limit is still recommended for fair per-client allocation.

After approved deployment: record real URL, load it in a browser, test proposal/approval/audit and failure states, then request explicit approval for a genuine sandbox checkout. Do not declare completion from a successful build alone.

## Configuration checklist

Render backend: `DATABASE_URL` (managed reference), `FRONTEND_ORIGIN`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MERCHANT_ID`, `PAYMENTS_ENABLED=false`, `CAPTURE_ENABLED=false`, `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `SESSION_CREATION_LIMIT_PER_MINUTE`, and `GEMINI_REQUESTS_PER_HOUR`.

Vercel frontend: set only server-side `BACKEND_URL=https://<render-service>.onrender.com`. Do not create `NEXT_PUBLIC_` provider variables. The Next.js `/api/:path*` rewrite keeps browser API calls same-origin.

Read [database migrations](DATABASE.md) before provisioning or rollback.

Free Render PostgreSQL has no managed backups and may be restarted for maintenance. Use a paid database with managed backups for any retained demo history, or treat the free database as disposable and state that limitation explicitly.
