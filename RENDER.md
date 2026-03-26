# Deploying TOBSEYTECH to Render.com

## Prerequisites
- A [Render.com](https://render.com) account
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster

## Steps

### 1. Create a new Web Service on Render
- Connect your GitHub repository (`tbeetech/tobseytech`)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `node dist/index.js`
- **Environment:** Node

### 2. Environment Variables (required)

Set the following environment variables in your Render service's **Environment** tab:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/tobseytech?retryWrites=true&w=majority&appName=Cluster0` |
| `SESSION_SECRET` | A long random string for session signing | `some-very-long-random-secret-string-here` |
| `NODE_ENV` | Set to production | `production` |
| `PORT` | Port to listen on (Render sets this automatically) | `10000` |

> **Important:** The server automatically sets Express's `trust proxy` to `1` so that session
> cookies and IP-based rate limiting work correctly when running behind Render's reverse proxy.
> No additional configuration is needed for this.

> **Session persistence:** When `MONGODB_URI` is set the server stores sessions in MongoDB
> (collection `sessions`) so that user logins **survive server restarts and re-deploys**.
> Without `MONGODB_URI` the server falls back to an in-memory store, which means all users
> are logged out on every restart — set `MONGODB_URI` in production to avoid this.
>
> **Fail-fast protection:** Production startup rejects missing `MONGODB_URI` or
> `SESSION_SECRET` to prevent silent data/session loss. `ADMIN_DASHBOARD_PASSWORD`
> is optional for startup but required to access `/dashboard`.

### 3. Optional Environment Variables (for email / contact form)

| Variable | Description |
|---|---|
| `SMTP_HOST` | SMTP server host (e.g. `smtp.gmail.com`) |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password or app password |
| `EMAIL_FROM` | Sender email address |

### 4. MongoDB Atlas Setup
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a free cluster (M0)
3. Create a database user with read/write permissions
4. Whitelist all IPs (`0.0.0.0/0`) or Render's outbound IP ranges
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` in the string with your database user's password
7. Paste the full URI as the `MONGODB_URI` environment variable in Render

### 5. First Admin User

Set the following additional environment variables so the server creates the primary admin account automatically on first startup:

| Variable | Description | Example |
|---|---|---|
| `ADMIN_SEED_EMAIL` | Email for the `tbeetech` admin account (username is always `tbeetech`) | `admin@example.com` |
| `ADMIN_SEED_PASSWORD` | Password for the `tbeetech` admin account | `change-me-to-a-strong-password` |
| `ADMIN_DASHBOARD_PASSWORD` | Secondary password required to open `/dashboard` — set this in your Render **Environment** tab, never in source code | `onebroonecode` |

Set these values in Render's **Environment** tab. Do not commit your real MongoDB URI,
session secret, or admin passwords to the repository.

The `tbeetech` user is created (or promoted to `admin`) automatically when the server starts.  If you prefer to promote an account manually, connect to your MongoDB Atlas cluster and run:

```
db.users.updateOne({ username: "your_username" }, { $set: { role: "admin" } })
```

### 6. Health Check
Render will auto-detect the running service. You can set a health check path to `/api/auth/me` (returns 401 if not authenticated, which is fine — it means the server is running).

---

## Features Available After Deployment
- ✅ User sign-up and sign-in
- ✅ Blog writing (all users — drafts; admin — publish)
- ✅ Blog post comments
- ✅ Like and bookmark blog posts
- ✅ Suggest edits on posts
- ✅ User profile management
- ✅ Friend requests between users
- ✅ Real-time chat (WebSocket on `/ws`)
