# Smart Resource Allocation Backend

FastAPI backend for the NGO + volunteer matching platform.

## Local Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Google credentials

Do not commit service-account JSON files. For local development, either set
`GOOGLE_APPLICATION_CREDENTIALS` to a local ignored JSON file path, or set
`GOOGLE_APPLICATION_CREDENTIALS_JSON` to the full JSON value in your local
`.env`.

For Cloud Run or other hosted deployments, store the new service-account JSON
as a secret/environment value and expose it as `GOOGLE_APPLICATION_CREDENTIALS_JSON`.

Health check:

```text
http://localhost:8000/health
```

API docs:

```text
http://localhost:8000/docs
```
