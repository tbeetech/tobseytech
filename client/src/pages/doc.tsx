import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Code2,
  Database,
  Download,
  GitBranch,
  Layers,
  Mail,
  Play,
  Route,
  Server,
  ShieldCheck,
  TestTube2,
} from "lucide-react";

const stack = [
  { label: "Frontend", value: "React 18, TypeScript, Vite, Tailwind, Radix UI", icon: Layers },
  { label: "Backend", value: "Node.js, Express, TypeScript", icon: Server },
  { label: "Database", value: "MongoDB Atlas with Mongoose", icon: Database },
  { label: "Testing", value: "TypeScript checks plus Playwright E2E", icon: TestTube2 },
];

const architecture = [
  {
    title: "Frontend routes",
    body: "Route-level pages live in client/src/pages. App.tsx wires public, authenticated, and admin routes through Wouter.",
    path: "client/src/App.tsx",
  },
  {
    title: "Shared UI and nav",
    body: "Reusable primitives are in client/src/components/ui, while layout/navigation lives in components such as Navigation.tsx.",
    path: "client/src/components/Navigation.tsx",
  },
  {
    title: "API surface",
    body: "All HTTP endpoints are registered inside server/routes.ts. New backend work usually starts there.",
    path: "server/routes.ts",
  },
  {
    title: "Persistence layer",
    body: "Mongoose models live in server/models and Atlas connectivity is enforced through server/mongodb.ts.",
    path: "server/mongodb.ts",
  },
];

const recentChanges = [
  "EmailOS lead aggregation was migrated from Python subprocess execution to a JavaScript-native backend module.",
  "MongoDB local/in-memory fallback was removed. Contributors must run against a real MongoDB Atlas URI.",
  "Global motion was reduced to improve UI responsiveness and navigation speed.",
  "Playwright E2E coverage was added for the EmailOS fetch-leads flow.",
  "Business lead aggregation is now plan-limited rather than fixed at a 500-request ceiling.",
];

const contributorTracks = [
  {
    title: "Backend: EmailOS and campaign infrastructure",
    tasks: [
      "Harden campaign dispatch, queuing, retries, bounce handling, and unsubscribe workflows.",
      "Improve lead quality scoring and list hygiene around dedupe, role tagging, and suppression logic.",
      "Add focused API tests around EmailOS onboarding, list aggregation, and campaign send flows.",
    ],
  },
  {
    title: "Frontend: contributor-facing and SaaS UX",
    tasks: [
      "Polish onboarding flow clarity for EmailOS so first-time users reach value faster.",
      "Expand docs/discoverability pages so open-source contributors can navigate the codebase faster.",
      "Keep interactions fast by avoiding heavy animations and preserving the current visual language.",
    ],
  },
  {
    title: "QA and DevEx",
    tasks: [
      "Increase Playwright coverage across auth, EmailOS, SPORTA, and admin dashboard paths.",
      "Document environment variables, deployment caveats, and contributor workflows consistently across docs.",
      "Add validation around startup prerequisites so missing env vars fail with clear messages.",
    ],
  },
];

const quickStart = [
  "Fork the repo, clone it locally, and run npm install.",
  "Create a .env file from .env.example and set at minimum MONGODB_URI to a working Atlas connection string.",
  "Run npm run dev for local development and npm run check before every pull request.",
  "For browser testing, install Playwright Chromium once with npx playwright install chromium, then run npm run test:e2e.",
];

const backendEntryPoints = [
  { title: "Lead aggregation", value: "server/emailLeadAggregator.ts", icon: Mail },
  { title: "HTTP routes", value: "server/routes.ts", icon: Route },
  { title: "Server boot", value: "server/index.ts", icon: Play },
  { title: "Env validation", value: "server/env.ts", icon: ShieldCheck },
  { title: "Contributor workflow", value: "CONTRIBUTING.md", icon: GitBranch },
];

const goodFirstIssues = [
  "Add more focused Playwright coverage for auth redirects and EmailOS onboarding edge cases.",
  "Break oversized frontend bundles into route-level chunks where possible.",
  "Improve docs around environment setup, especially Atlas URI, SMTP, and optional AI provider keys.",
  "Add small backend tests around list aggregation, dedupe behavior, and plan limits.",
  "Refine EmailOS empty states and inline help text for first-time users.",
];

const backendOwnership = [
  {
    area: "Auth and sessions",
    owner: "server/index.ts, hooks/use-auth.tsx, passport/session setup",
    note: "Touches login, registration, session cookies, and route protection.",
  },
  {
    area: "EmailOS routes and workflows",
    owner: "server/routes.ts, server/models/Email*.ts",
    note: "Covers onboarding, lists, campaigns, tracking, and account limits.",
  },
  {
    area: "Lead aggregation",
    owner: "server/emailLeadAggregator.ts",
    note: "Owns public-source discovery, domain filtering, business-email generation, and fallbacks.",
  },
  {
    area: "Infrastructure and startup",
    owner: "server/env.ts, server/mongodb.ts, server/vite.ts",
    note: "Controls Atlas-only startup requirements, runtime validation, and local/prod server boot.",
  },
];

export default function DocPage() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>Contributor Docs, ARCOLYTE TECHNOLOGIES</title>
      <Navigation />

      <main className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-6xl space-y-12">
          <section className="glass-effect-strong rounded-3xl border border-neon-cyan/20 p-8 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-5">
                  <BookOpen className="w-4 h-4" /> Open Source Contributor Doc
                </div>
                <h1 className="font-orbitron font-black text-4xl md:text-6xl gradient-text mb-4 leading-tight">
                  Build On ARCOLYTE TECHNOLOGIES Without Guesswork
                </h1>
                <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                  This route is the fast onboarding surface for external contributors. It explains what the project is,
                  where the important backend and frontend entry points live, what changed recently, and what work is
                  worth picking up next.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handlePrint} className="bg-neon-cyan text-space-black font-orbitron font-bold">
                  <Download className="w-4 h-4 mr-2" /> Save / Print PDF
                </Button>
                <a href="/contributor-brief.html" target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan font-orbitron">
                    <BookOpen className="w-4 h-4 mr-2" /> Static Brief
                  </Button>
                </a>
                <Link href="/features">
                  <Button variant="outline" className="border-white/15 text-gray-200 font-orbitron">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Product
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stack.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="glass-effect rounded-2xl border border-white/10 p-5">
                  <Icon className="w-5 h-5 text-neon-cyan mb-3" />
                  <p className="font-orbitron text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="text-sm text-white leading-relaxed">{item.value}</p>
                </div>
              );
            })}
          </section>

          <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="glass-effect rounded-3xl border border-white/10 p-7">
              <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Quick Start For Contributors</h2>
              <div className="space-y-4">
                {quickStart.map((step) => (
                  <div key={step} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-galactic-green mt-1 shrink-0" />
                    <p className="text-gray-300 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-galactic-orange/20 bg-galactic-orange/5 p-4">
                <p className="font-orbitron text-xs text-galactic-orange mb-2">Required local baseline</p>
                <pre className="text-xs text-gray-200 overflow-x-auto whitespace-pre-wrap">{`npm install\nnpm run dev\nnpm run check\nnpx playwright install chromium\nnpm run test:e2e`}</pre>
              </div>
            </div>

            <div className="glass-effect rounded-3xl border border-white/10 p-7">
              <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Key Entry Points</h2>
              <div className="space-y-4">
                {backendEntryPoints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/10 p-4 bg-space-dark/40">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-neon-cyan" />
                        <p className="font-orbitron text-sm text-white">{item.title}</p>
                      </div>
                      <p className="text-xs text-gray-400">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="glass-effect rounded-3xl border border-white/10 p-7">
            <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Architecture In Plain English</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {architecture.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-space-dark/30 p-5">
                  <p className="font-orbitron text-sm text-neon-cyan mb-2">{item.title}</p>
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">{item.body}</p>
                  <p className="text-xs text-gray-500">{item.path}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
            <div className="glass-effect rounded-3xl border border-white/10 p-7">
              <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Recent Shipped Changes</h2>
              <div className="space-y-4">
                {recentChanges.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Code2 className="w-4 h-4 text-galactic-orange mt-1 shrink-0" />
                    <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-3xl border border-white/10 p-7">
              <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Where Contributors Can Help</h2>
              <div className="space-y-5">
                {contributorTracks.map((track) => (
                  <div key={track.title} className="rounded-2xl border border-white/10 bg-space-dark/30 p-5">
                    <p className="font-orbitron text-sm text-white mb-3">{track.title}</p>
                    <div className="space-y-2">
                      {track.tasks.map((task) => (
                        <div key={task} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-galactic-green mt-1 shrink-0" />
                          <p className="text-sm text-gray-300 leading-relaxed">{task}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            <div className="glass-effect rounded-3xl border border-white/10 p-7">
              <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Good First Issues</h2>
              <div className="space-y-4">
                {goodFirstIssues.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-galactic-green mt-1 shrink-0" />
                    <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-3xl border border-white/10 p-7">
              <h2 className="font-orbitron font-bold text-2xl gradient-text mb-5">Backend Ownership Notes</h2>
              <div className="space-y-4">
                {backendOwnership.map((item) => (
                  <div key={item.area} className="rounded-2xl border border-white/10 bg-space-dark/30 p-5">
                    <p className="font-orbitron text-sm text-neon-cyan mb-2">{item.area}</p>
                    <p className="text-xs text-gray-500 mb-2">{item.owner}</p>
                    <p className="text-sm text-gray-300 leading-relaxed">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}