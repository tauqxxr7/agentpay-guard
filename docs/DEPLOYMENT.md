# Deployment preparation — not deployed

Frontend target: Vercel, project root `frontend`, build `npm run build`. Set server-only `BACKEND_URL` to the eventual HTTPS backend URL. Rewrites are built from that variable; rebuild when changing it. Do not put provider secrets in NEXT_PUBLIC variables.

Vercel environment requirement: `BACKEND_URL` as a non-secret Config value scoped separately for Preview and Production. PayPal, AI, and database secrets belong only on the Render backend; they must never be configured in the frontend project.

Backend target: Render Python web service, project root `backend`, build `pip install -r requirements.txt`, start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health path `/health`.

Use PostgreSQL via `DATABASE_URL=postgresql+psycopg://...`, set `FRONTEND_ORIGIN` to the exact HTTPS frontend origin, and configure secrets through platform secret settings. Use one worker initially. Keep `PAYMENTS_ENABLED=false` and `CAPTURE_ENABLED=false` until the corresponding sandbox tests are explicitly authorized. Schema creation currently uses SQLAlchemy `create_all`; migration tooling must be added before multi-version production rollout.

Before public publishing: add IP/edge session issuance limits, test PostgreSQL, configure budget limits for hosted AI, verify HTTPS/proxy/CORS and session isolation, and obtain owner approval. No platform resources were created or modified.

After approved deployment: record real URL, load it in a browser, test proposal/approval/audit and failure states, then request explicit approval for a genuine sandbox checkout. Do not declare completion from a successful build alone.
