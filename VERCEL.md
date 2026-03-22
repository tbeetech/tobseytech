# Deploying TOBSEYTECH to Vercel

## Prerequisites
- A [Vercel](https://vercel.com) account
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster

## Steps

### 1. Import the project on Vercel
- Go to https://vercel.com/new
- Import the GitHub repository `tbeetech/tobseytech`
- Vercel will automatically detect the `vercel.json` configuration

### 2. Environment Variables (required)

Set the following environment variables in your Vercel project's **Settings → Environment Variables** tab:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/tobseytech?retryWrites=true&w=majority&appName=Cluster0` |
| `SESSION_SECRET` | A long random string for session signing | `some-very-long-random-secret-string-here` |
| `NODE_ENV` | Set to production | `production` |

> **Session persistence:** When `MONGODB_URI` is set the server stores sessions in MongoDB
> (collection `sessions`) so that user logins survive cold-start restarts between serverless
> invocations.  Without `MONGODB_URI` the server falls back to an in-memory store — every cold
> start logs all users out, so `MONGODB_URI` is strongly recommended in production.

### 3. Optional Environment Variables

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password or app password |
| `EMAIL_FROM` | Sender email address |
| `APP_URL` | Public URL of your Vercel deployment (e.g. `https://tobseytech.vercel.app`) |
| `OPENAI_API_KEY` | Required for Prophet AI chat widget |
| `PERPLEXITY_API_KEY` | Required for Cosmo Research AI (falls back to OpenAI if not set) |

### 4. Admin Dashboard Password

| Variable | Description | Example |
|---|---|---|
| `ADMIN_DASHBOARD_PASSWORD` | Secondary password required to open `/dashboard` | `use-a-strong-random-password-here` |
| `ADMIN_SEED_EMAIL` | Email for the `tbeetech` admin account | `admin@example.com` |
| `ADMIN_SEED_PASSWORD` | Password for the `tbeetech` admin account | `change-me-to-a-strong-password` |

The `tbeetech` user is created (or promoted to `admin`) automatically when the serverless function cold-starts for the first time.

### 5. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (M0)
3. Create a database user with read/write permissions
4. Whitelist all IPs (`0.0.0.0/0`) — Vercel functions use dynamic IPs
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` with your database user's password
7. Paste the full URI as the `MONGODB_URI` environment variable in Vercel

### 6. Deploy
After setting environment variables, trigger a deployment:
```
git push origin main
```
Vercel will build the frontend (`vite build`) and deploy `api/index.ts` as a serverless function. All routes are available immediately.

---

## How it works

| Layer | Platform |
|---|---|
| Frontend (React SPA) | Vercel Edge CDN — built from `client/` → `dist/public/` |
| API (`/api/*`) | Vercel Serverless Function — `api/index.ts` (Node.js 20) |
| Database | MongoDB Atlas |
| Sessions | MongoDB (connect-mongo) |

Requests for `/api/*` are routed to the serverless Express function; all other paths are served from the static CDN build with a SPA fallback to `index.html`.

---

## ⚠️ Known Limitations on Vercel

| Feature | Status |
|---|---|
| All API endpoints | ✅ Fully supported |
| Auth (sign-up, sign-in, sessions) | ✅ Fully supported |
| Blog posts, comments, likes, bookmarks | ✅ Fully supported |
| User profiles & friend requests | ✅ Fully supported |
| Contact form & email (SMTP) | ✅ Fully supported |
| Prophet AI & Cosmo Research AI | ✅ Fully supported |
| **Real-time chat (WebSocket `/ws`)** | ❌ Not supported — Vercel serverless functions do not support persistent WebSocket connections. Messages sent via the REST API are still stored, but live push notifications will not arrive until the recipient refreshes the page. |

If real-time chat is critical, consider deploying to [Render.com](RENDER.md) (which runs the full Node.js server with WebSocket support), or add a third-party WebSocket/push service.
