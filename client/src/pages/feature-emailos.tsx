import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  BarChart3,
  Users,
  Zap,
  Shield,
  Brain,
  Target,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  Clock,
  Database,
  Globe2,
  Cpu,
  Lock,
  Layers,
  FlaskConical,
  Webhook,
  MousePointerClick,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const coreCapabilities = [
  {
    icon: Mail,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    title: "React-Rendered Email Templates",
    desc: "High-fidelity, component-based email templates built with @react-email. Render pixel-perfect HTML emails server-side — no more broken Outlook layouts.",
  },
  {
    icon: Users,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    title: "Multi-Tenant Contact Lists",
    desc: "Every organisation gets an isolated namespace. Contacts, lists, campaigns, and analytics are fully scoped to your organisation ID — zero data bleed.",
  },
  {
    icon: Brain,
    color: "text-neon-purple",
    border: "border-neon-purple",
    title: "AI-Powered Subject Line & Body",
    desc: "Generate, rewrite, and A/B test email subjects and body copy using Gemini AI. Tone selector, audience targeting, and spam-score analysis built in.",
  },
  {
    icon: Clock,
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    title: "Cron-Driven Dispatch Engine",
    desc: "Schedule campaigns down to the minute. The /api/cron/dispatch endpoint is triggered by Vercel Cron or GitHub Actions and processes your campaign queue atomically.",
  },
  {
    icon: MousePointerClick,
    color: "text-galactic-green",
    border: "border-galactic-green",
    title: "Open & Click Tracking Pixel",
    desc: "Lightweight 1×1 GIF tracking pixel and click-wrap API. All events are logged back to MongoDB using atomic $inc updates — zero performance hit.",
  },
  {
    icon: FlaskConical,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    title: "A/B Split Testing (Pro+)",
    desc: "Split your audience automatically between two subject lines. The winning variant (by open rate) is auto-selected after a configurable test window.",
  },
  {
    icon: Database,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    title: "MongoDB Source of Truth",
    desc: "Organisations, lists, campaigns and events all live in the same MongoDB Atlas cluster as your main app. One database — one source of truth.",
  },
  {
    icon: Shield,
    color: "text-galactic-green",
    border: "border-galactic-green",
    title: "JWT Bridge Authentication",
    desc: "The Next.js sidecar validates your existing Express JWTs automatically. Users stay logged in across both stacks — no duplicate logins.",
  },
  {
    icon: Webhook,
    color: "text-neon-purple",
    border: "border-neon-purple",
    title: "Custom Cron Expressions (Enterprise)",
    desc: "Enterprise teams can set per-campaign custom cron schedules (down to 1-minute intervals) for time-critical newsletters and transactional sequences.",
  },
];

const tiers = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "Forever",
    color: "text-galactic-green",
    border: "border-galactic-green",
    bg: "from-galactic-green/10 to-galactic-green/5",
    badge: null,
    limits: {
      contacts: "500 contacts",
      emails: "1,000 emails / month",
      campaigns: "1 active campaign",
      templates: "3 starter templates",
      tracking: "Open tracking",
      analytics: "Basic analytics",
      support: "Community support",
      abTesting: null,
      customCron: null,
      whiteLabel: null,
      api: null,
    },
    cta: "Start Free",
    tier: "starter",
  },
  {
    name: "Pro",
    price: "$29",
    priceNote: "/ month",
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    bg: "from-neon-cyan/10 to-neon-cyan/5",
    badge: "Most Popular",
    limits: {
      contacts: "10,000 contacts",
      emails: "50,000 emails / month",
      campaigns: "10 active campaigns",
      templates: "All templates + AI generation",
      tracking: "Open & click tracking",
      analytics: "Advanced analytics & heatmaps",
      support: "Priority email support",
      abTesting: "A/B subject split testing",
      customCron: null,
      whiteLabel: null,
      api: "Read-only API access",
    },
    cta: "Upgrade to Pro",
    tier: "pro",
  },
  {
    name: "Enterprise",
    price: "$99",
    priceNote: "/ month",
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    bg: "from-galactic-orange/10 to-galactic-orange/5",
    badge: "Unlimited Power",
    limits: {
      contacts: "Unlimited contacts",
      emails: "Unlimited emails / month",
      campaigns: "Unlimited campaigns",
      templates: "Custom AI-generated templates",
      tracking: "Full tracking + unique open/click dedup",
      analytics: "Full analytics + export",
      support: "Dedicated SLA support (99.9% uptime)",
      abTesting: "Advanced A/B + multivariate testing",
      customCron: "Custom cron (1-min intervals)",
      whiteLabel: "White-label & custom domain",
      api: "Full REST API + webhooks",
    },
    cta: "Contact Sales",
    tier: "enterprise",
  },
];

const techStack = [
  { label: "Next.js Route Handlers", icon: Cpu },
  { label: "Amazon SES Delivery", icon: Mail },
  { label: "MongoDB Atlas", icon: Database },
  { label: "@react-email Components", icon: Layers },
  { label: "JWT Auth Bridge", icon: Lock },
  { label: "Vercel Cron / GitHub Actions", icon: RefreshCw },
  { label: "Atomic $inc Tracking", icon: MousePointerClick },
  { label: "Multi-Tenant orgId Scope", icon: Globe2 },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function FeatureEmailOSPage() {
  const [activeTier, setActiveTier] = useState(1);
  const { user } = useAuth();

  // Unauthenticated users are sent to register and redirected back to /emailos after auth
  const launchHref = user ? "/emailos" : "/auth?redirect=/emailos&tab=register";

  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>EmailOS – Multi-Tenant Email Marketing Platform | TOBSEYTECH</title>
      <Navigation />

      <main className="pt-20">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-24 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-galactic-orange/5 to-neon-purple/5 pointer-events-none" />
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-6">
                <Mail className="w-4 h-4" /> Feature 13 — EmailOS
              </div>
              <h1 className="font-orbitron font-black text-5xl md:text-7xl gradient-text mb-4 leading-tight">
                EmailOS
              </h1>
              <p className="text-xl md:text-2xl text-neon-cyan font-orbitron font-semibold mb-6">
                Multi-Tenant Email Marketing Operating System
              </p>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed mb-10">
                A Next.js 15 sidecar module that plugs directly into your MERN stack. Manage contacts,
                design AI-rendered campaigns, schedule delivery via SES, and track every open and click —
                all scoped to your organisation with zero data bleed.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { label: "Contacts (Free)", value: "500" },
                  { label: "Contacts (Pro)", value: "10K" },
                  { label: "Dispatch Engine", value: "Cron" },
                  { label: "Tracking", value: "Pixel" },
                  { label: "Email Provider", value: "SES" },
                  { label: "Auth", value: "JWT Bridge" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-4 py-3 glass-effect rounded-xl border border-neon-cyan/20 text-center">
                    <div className="font-orbitron font-black text-neon-cyan text-2xl">{value}</div>
                    <div className="text-gray-400 text-xs font-orbitron whitespace-nowrap">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Link href={launchHref}>
                  <Button className="bg-neon-cyan text-space-black font-orbitron font-bold px-8 h-12 text-sm hover:bg-neon-cyan/80 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
                    <Zap className="w-4 h-4 mr-2" /> {user ? "Launch EmailOS" : "Create Free Account"}
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" className="border-neon-cyan/40 text-neon-cyan font-orbitron font-bold px-8 h-12 text-sm hover:bg-neon-cyan/10">
                    <ArrowLeft className="w-4 h-4 mr-2" /> All Features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Core Capabilities ── */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-4">
                <Brain className="w-4 h-4" /> Platform Capabilities
              </div>
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                Enterprise Email Infrastructure
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                EmailOS is not a basic newsletter tool — it's a full-stack email operating system designed for multi-tenant SaaS.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreCapabilities.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                    className={`glass-effect p-6 rounded-2xl border ${cap.border}/20 hover:${cap.border}/40 transition-all`}
                  >
                    <div className={`w-12 h-12 rounded-xl border ${cap.border}/30 flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${cap.color}`} />
                    </div>
                    <h3 className="font-orbitron font-bold text-white text-sm mb-2">{cap.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{cap.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Pricing Tiers ── */}
        <section className="py-20 px-6 bg-space-dark/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-4">
                <TrendingUp className="w-4 h-4" /> Pricing Plans
              </div>
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                Choose Your Plan
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Start free and scale as you grow. Every tier is powered by the same core infrastructure.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setActiveTier(i)}
                  className={`glass-effect p-7 rounded-2xl border cursor-pointer transition-all relative flex flex-col ${
                    activeTier === i
                      ? `${tier.border} shadow-[0_0_30px_rgba(6,182,212,0.2)]`
                      : `${tier.border}/20 hover:${tier.border}/40`
                  }`}
                >
                  {tier.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-orbitron font-bold bg-gradient-to-r ${tier.bg} border ${tier.border} ${tier.color}`}>
                      {tier.badge}
                    </div>
                  )}
                  <div className="mb-5">
                    <h3 className={`font-orbitron font-black text-lg ${tier.color} mb-1`}>{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="font-orbitron font-black text-4xl text-white">{tier.price}</span>
                      <span className="text-gray-400 text-sm font-orbitron">{tier.priceNote}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {Object.values(tier.limits).filter(Boolean).map((feat) => (
                      <li key={feat!} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${tier.color}`} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={launchHref}>
                    <Button
                      className={`w-full font-orbitron text-sm bg-gradient-to-r ${tier.bg} border ${tier.border}/40 text-white hover:opacity-80 transition-all`}
                    >
                      {user ? tier.cta : "Create Free Account"} <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 text-neon-purple text-sm font-orbitron mb-4">
                <Cpu className="w-4 h-4" /> Under the Hood
              </div>
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                The Technical Architecture
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                EmailOS is a Next.js 15 "sidecar" that shares your MongoDB Atlas cluster and validates your existing Express JWTs — zero duplicate infrastructure.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {techStack.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 px-4 py-2 glass-effect rounded-xl border border-neon-purple/20 hover:border-neon-purple/50 transition-all"
                  >
                    <Icon className="w-4 h-4 text-neon-purple" />
                    <span className="text-sm font-orbitron text-gray-300">{item.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Architecture Principle ── */}
        <section className="py-16 px-6 bg-space-dark/40">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="glass-effect p-10 rounded-3xl border border-neon-cyan/20">
              <Brain className="w-12 h-12 text-neon-cyan mx-auto mb-5" />
              <blockquote className="font-orbitron font-bold text-2xl gradient-text mb-4">
                "Decouple the UI, Unify the Data."
              </blockquote>
              <p className="text-gray-400 leading-relaxed">
                React components live in different stacks — MERN handles the community, Next.js handles the email engine — but both talk to the <span className="text-neon-cyan font-semibold">same MongoDB source of truth</span>. Your community members get a seamless, unified experience.
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="glass-effect p-10 rounded-3xl border border-galactic-orange/30">
              <h2 className="font-orbitron font-bold text-3xl gradient-text mb-4">
                Ready to Launch Your Email Engine?
              </h2>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Start free today. No credit card required. Build your first campaign in minutes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={launchHref}>
                  <Button size="lg" className="bg-gradient-to-r from-neon-cyan to-galactic-orange text-space-black font-orbitron font-bold">
                    <Zap className="w-4 h-4 mr-2" /> {user ? "Launch EmailOS" : "Create Free Account"}
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 font-orbitron">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
