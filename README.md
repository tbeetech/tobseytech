# ARCOLYTE TECHNOLOGIES — Future Digital Solutions

> **Kingdom Enhancement Corp (KEC) — Phase 1**  
> AI-powered digital agency platform for SMEs, startups, and social-impact organisations across Africa and beyond.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

ARCOLYTE TECHNOLOGIES is a full-stack SaaS platform that combines:

- **Public website** — services, blog, vlog, case studies, pricing
- **User platform** — auth, profiles, social graph, real-time chat
- **Blog / Vlog CMS** — rich editor, drafts, publish workflow, bot-powered RSS auto-posting
- **Admin dashboard** (Speed Cracker) — analytics, content approval, workflows
- **AI assistants** — Prophet AI (navigation chat) and Cosmo Research AI (tech & political research)
- **SPORTA** — a SaaS feature accessible to all authenticated users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite, Tailwind CSS, Radix UI, GSAP, Three.js |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas via Mongoose |
| Auth | Passport.js (local strategy) + express-session |
| Real-time | WebSocket (`ws`) |
| AI | Google Gemini Flash, Perplexity API, OpenAI |
| Deployment | Render.com (full server) or Vercel (serverless) |

---

## Project Structure

```
arcolytetech/
├── client/                  # React frontend (Vite root)
│   ├── public/              # Static assets (favicon, PDFs, robots.txt)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── sections/    # Full-page section components
│   │   │   └── ui/          # shadcn/ui primitives
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility helpers
│   │   ├── pages/           # Route-level page components
│   │   └── constants/       # Shared frontend constants (URLs, etc.)
│   └── index.html           # SPA entry point with SEO meta tags
│
├── server/                  # Express backend
│   ├── models/              # Mongoose models
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # All API routes + sitemap.xml
│   ├── storage.ts           # IStorage interface + MemStorage (dev fallback)
│   ├── mongoStorage.ts      # MongoDB implementation of IStorage
│   ├── ogTags.ts            # Server-side OG/Twitter meta injection
│   ├── botWorker.ts         # RSS auto-posting background worker
│   ├── seed.ts              # Admin user seeding
│   └── env.ts               # Env var validation
│
├── shared/
│   └── schema.ts            # Zod schemas + TypeScript interfaces shared by client & server
│
├── api/
│   └── index.ts             # Vercel serverless entry point
│
├── .env.example             # All supported environment variables (copy to .env)
├── RENDER.md                # Render.com deployment guide
├── VERCEL.md                # Vercel deployment guide
└── CONTRIBUTING.md          # Contributor guide
```

---

## Quick Start (Local Dev)

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A **MongoDB Atlas** cluster (free M0 tier is fine)

### 1. Clone & install

```bash
git clone https://github.com/tbeetech/arcolytetech.git
cd arcolytetech
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and fill in MONGODB_URI, SESSION_SECRET, etc.
```

The only truly required variable for local development is `MONGODB_URI`.
Without it the server will fail fast at startup.

### 3. Start the dev server

```bash
npm run dev
```

The app is now running at **http://localhost:5000**.  
Hot-module replacement is enabled for the frontend; the backend restarts automatically via `tsx`.

---

## Environment Variables

All variables are documented in [`.env.example`](.env.example).  
Key variables:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Production | MongoDB Atlas connection string |
| `SESSION_SECRET` | Recommended | Signing key for session cookies |
| `ADMIN_DASHBOARD_PASSWORD` | Recommended | Secondary password for `/dashboard` |
| `ADMIN_SEED_EMAIL` | Optional | Email for the auto-created `tbeetech` admin |
| `ADMIN_SEED_PASSWORD` | Optional | Password for the auto-created `tbeetech` admin |
| `GEMINI_FLASH_API_KEY` | Optional | Enables Prophet AI chat |
| `PERPLEXITY_API_KEY` | Optional | Enables Cosmo Research AI |
| `OPENAI_API_KEY` | Optional | Fallback AI provider |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Optional | Contact form email delivery |

> ⚠️ **Never commit real secrets.** Set them in your host's environment settings or a local `.env` file (which is git-ignored).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR (port 5000) |
| `npm run build` | Build frontend + bundle server for production |
| `npm start` | Run the production build (`dist/index.js`) |
| `npm run check` | TypeScript type-check (no emit) |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run db:push` | Push Drizzle schema to PostgreSQL (legacy / optional) |

---

## Deployment

- **Render.com** — see [`RENDER.md`](RENDER.md) for step-by-step instructions
- **Vercel** — see [`VERCEL.md`](VERCEL.md) for serverless deployment (note: WebSocket not supported on Vercel)

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full contributor guide.

**TL;DR:**

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes and run `npm run check` to catch TypeScript errors
3. Open a pull request against `main`

---

## License

MIT — see [`package.json`](package.json).
