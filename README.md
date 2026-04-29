# TrackIt NG

Offline-first personal finance tracker for Nigerian users. Primary interface is a Telegram bot, with a web dashboard and a marketing site.

## Monorepo Structure

- `backend/` FastAPI + SQLite API
- `bot/` Telegram bot (python-telegram-bot)
- `web/` Next.js app (marketing site + web dashboard)

## Local Setup

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create `backend/.env`:

```
DATABASE_URL=sqlite:///./trackit.db
JWT_SECRET=change-me
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=no-reply@trackit.ng
```

### Telegram Bot

```bash
cd bot
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `bot/.env`:

```
BOT_TOKEN=your_telegram_token
BACKEND_URL=http://localhost:8000
```

Run:

```bash
cd ..
python -m bot
```

### Web App + Marketing Site

```bash
cd web
npm install
npm run dev
```

Create `web/.env`:

```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

Marketing site is served at `/`, and the web dashboard starts at `/dashboard`. Use `/login` to sign in or continue as a guest.

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo>.git
git branch -M main
git push -u origin main
```

Do not commit real `.env` files, virtual environments, `node_modules`, `.next`, Python caches, or `backend/trackit.db`. This repo includes `.env.example` files for the values each service needs.

## Free Deployment (Starter)

### Backend (Render – free tier)
1. Go to Render and create a new **Web Service**.
2. Connect your GitHub repo.
3. Root directory: `backend`
4. Build command:
   ```bash
   pip install -r requirements.txt
   ```
5. Start command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 10000
   ```
6. Add env vars from `backend/.env`.
   - Use a strong `JWT_SECRET`.
   - For a quick first deploy, use `DATABASE_URL=sqlite:///./trackit.db`.
   - For production data you care about, use a hosted PostgreSQL database and set `DATABASE_URL` to that URL, because free web services can lose local SQLite files.
7. Deploy.

### Bot (Render – free tier worker)
1. Create a new **Background Worker**.
2. Root directory: `bot`
3. Build command:
   ```bash
   pip install -r requirements.txt
   ```
4. Start command:
   ```bash
   python -m bot
   ```
5. Add env vars from `bot/.env`.
   - Set `BACKEND_URL` to the public Render backend URL, for example `https://your-backend.onrender.com`.

### Web App (Vercel – free tier)
1. Import GitHub repo in Vercel.
2. Root directory: `web`
3. Build command: `npm run build`
4. Output: Next.js default
5. Add `NEXT_PUBLIC_API_BASE` env var pointing to your backend URL, for example `https://your-backend.onrender.com`.

## Database (SQLite)

The database is a local file:

```
backend/trackit.db
```

### Check your data

**Option 1: SQLite CLI**
```bash
sqlite3 backend/trackit.db
.tables
SELECT * FROM expenses LIMIT 5;
.quit
```

**Option 2: DB Browser for SQLite**
1. Download “DB Browser for SQLite”.
2. Open `backend/trackit.db`.
3. Browse tables and data.

## Email Verification (SMTP)

Email verification uses SMTP. You can use:
- Gmail (App Password)
- Brevo (free tier)
- Mailgun (trial)

### Gmail example
1. Enable 2FA on your Google account.
2. Create an **App Password**.
3. Use in `backend/.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your@gmail.com
   SMTP_PASS=app_password
   SMTP_FROM=no-reply@trackit.ng
   ```

### Brevo example
1. Create account and SMTP key.
2. Use:
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your_brevo_login
   SMTP_PASS=your_brevo_key
   SMTP_FROM=no-reply@trackit.ng
   ```

If SMTP is missing, the backend returns a dev code through Telegram. For production, SMTP must be configured.

## Notes

- Default categories are auto-created on user creation.
- Telegram users are identified by `telegram_id` and auto-provisioned.
- Email linking flow: use `/link` in Telegram to receive a code, then verify in the web app Settings page to set email/password.
- Guest mode: `/login` → “Continue without account”.
