# Contributing to ARCOLYTE TECHNOLOGIES

Thank you for your interest in contributing! This guide will help you get up and running quickly — whether you're a seasoned engineer or a first-time open-source contributor.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Coding Conventions](#coding-conventions)
- [Adding a New Page](#adding-a-new-page)
- [Adding a New API Route](#adding-a-new-api-route)
- [Pull Request Checklist](#pull-request-checklist)
- [Reporting Bugs](#reporting-bugs)

---

## Code of Conduct

Be respectful, inclusive, and constructive. We're building Kingdom-enhancement technology — treat every contributor as you would like to be treated.

---

## Getting Started

Follow the **Quick Start** section in [README.md](README.md) to get a local dev environment running.

```bash
git clone https://github.com/tbeetech/arcolytetech.git
cd arcolytetech
npm install
cp .env.example .env   # fill in at least MONGODB_URI
npm run dev            # http://localhost:5000
```

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code — always deployable |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Maintenance, dependency updates, refactors |
| `docs/<name>` | Documentation-only changes |

**Always branch off `main`** and keep your branch short-lived.

---

## Coding Conventions

### TypeScript

- All new files must be TypeScript (`.ts` / `.tsx`).
- Avoid `any` unless interfacing with Mongoose docs where it is an established pattern (see `(storage as any)` for SPORTA/VlogPost calls).
- Use the `IStorage` interface in `server/storage.ts` for all data access in routes.

### React / Frontend

- Pages go in `client/src/pages/` — one file per route.
- Reusable components go in `client/src/components/`.
- Full-section page blocks go in `client/src/components/sections/`.
- Use `shadcn/ui` primitives from `client/src/components/ui/` for all UI elements — do not add raw HTML or third-party component libraries without discussion.
- Tailwind classes only — no inline `style={{}}` unless required for dynamic values.

### Backend

- All routes are registered inside `_registerRouteHandlers` in `server/routes.ts`.
- Use the `requireAuth`, `requireAdmin`, or `requireDashboardAccess` middleware as appropriate.
- Rate-limit any public write endpoints with `authRateLimiter`.
- Validate request bodies with Zod schemas imported from `shared/schema.ts`.

### Shared Schema

- `shared/schema.ts` is the single source of truth for data shapes used by both frontend and backend.
- When adding a new entity, add its Zod schema and TypeScript interface here first, then implement the storage methods.

---

## Adding a New Page

1. Create `client/src/pages/my-page.tsx` with a default-exported React component.
2. Import and add a `<Route>` in `client/src/App.tsx`.
3. Update the sitemap static pages list in `server/routes.ts` (search for `staticPages`).
4. Add a `<meta>` description in the page component if it differs from the global one in `client/index.html`.

### Minimal page template

```tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>My Page — ARCOLYTE TECHNOLOGIES</title>
      {/* content */}
    </div>
  );
}
```

---

## Adding a New API Route

1. Open `server/routes.ts` and find the relevant section inside `_registerRouteHandlers`.
2. Add your `app.get / app.post / ...` handler.
3. Validate input with Zod:
   ```ts
   const body = mySchema.safeParse(req.body);
   if (!body.success) return res.status(400).json({ message: body.error.message });
   ```
4. Use `storage.*` methods for data access. If the method doesn't exist on `IStorage`, add it to the interface **and** implement it in both `MemStorage` (storage.ts) and `MongoStorage` (mongoStorage.ts).

---

## Pull Request Checklist

Before opening a PR, make sure:

- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds
- [ ] Your branch is up-to-date with `main`
- [ ] You have not committed secrets, `.env` files, or `node_modules`
- [ ] New pages are added to the sitemap static list
- [ ] New environment variables are documented in `.env.example`

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/tbeetech/arcolytetech/issues) and include:

1. Steps to reproduce
2. Expected behaviour
3. Actual behaviour
4. Environment (OS, Node version, browser)

---

Thanks for contributing — we appreciate every commit, big or small! 🚀
