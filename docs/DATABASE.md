# Database and migrations

AgentPay Guard supports SQLite for local single-process development and PostgreSQL for deployment. PostgreSQL is the intended public-demo database. Local SQLite data, including historical Sandbox records, must never be copied into a hosted database.

## Setup

From `backend/`, install dependencies and apply migrations before starting the API:

```powershell
python -m pip install -r requirements.txt
python -m alembic upgrade head
python -m uvicorn app.main:app --env-file ../.env --port 8000
```

`DATABASE_URL` may be `sqlite:///./agentpay.db`, `postgresql://...`, or `postgresql+psycopg://...`. Render-style PostgreSQL URLs are normalized to the psycopg 3 driver. Persistent databases are never initialized with `create_all`; startup assumes `alembic upgrade head` completed successfully. Only isolated in-memory SQLite tests create their schema directly.

## Deployment and rollback

Render runs `alembic upgrade head` as a pre-deploy command. A failed migration stops deployment before the new process starts. Back up PostgreSQL before every schema change and test both upgrade and downgrade on disposable data. The initial migration inspects the live schema so it can safely adopt the legacy local SQLite tables; validate it online against a disposable database rather than using Alembic's offline SQL mode.

The initial downgrade removes all AgentPay Guard tables and their data. Do not run `alembic downgrade base` against a database containing records that must be retained. Restore from a verified managed backup when a destructive rollback would otherwise be required. Future migrations should prefer forward fixes and explicitly document data transformations.

## Verification

`tests/test_migrations.py` always verifies a clean SQLite migration and restart persistence. Its opt-in PostgreSQL test requires a disposable database:

```powershell
$env:TEST_POSTGRES_URL='postgresql+psycopg://postgres@127.0.0.1:55432/agentpay_test'
python -m pytest -q tests/test_migrations.py
```

The PostgreSQL test upgrades from an empty schema, persists a session and proposal across engine/application restarts, verifies owner isolation, reuses one mocked order, records buyer approval once, then downgrades the disposable schema. It never contacts PayPal.
