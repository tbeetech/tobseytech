import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Globe2,
  Brain,
  Share2,
  BarChart3,
  Filter,
  Shield,
  Play,
  CheckCircle,
  Layers,
  Target,
  TrendingUp,
  Cpu,
  Users,
  Sparkles,
  Video,
  Rss,
  RefreshCw,
  Bot,
} from "lucide-react";

// ─── Feature highlights data ─────────────────────────────────────────────────

const coreCapabilities = [
  {
    icon: Globe2,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    title: "Multi-Platform Aggregator",
    desc: "Pulls public content from 17+ platforms including Facebook, Instagram, TikTok, YouTube, Reddit, Telegram, and RSS feeds into a unified queue.",
  },
  {
    icon: Brain,
    color: "text-neon-purple",
    border: "border-neon-purple",
    title: "AI Content Reshaper",
    desc: "Rewrites, rephrases, and optimises every piece of content using LLMs. Tone selector, audience targeting, SEO toggle, and viral optimisation built in.",
  },
  {
    icon: Share2,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    title: "Mass Auto-Publishing Engine",
    desc: "Cross-post to Facebook, Instagram, TikTok, X, LinkedIn, Pinterest, Telegram, and your own blog/vlog simultaneously with full scheduling support.",
  },
  {
    icon: Video,
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    title: "Embedded Vlog System",
    desc: "Auto-generates vlog entries with embedded YouTube, TikTok, Vimeo, and Facebook video players, no local video storage required.",
  },
  {
    icon: Shield,
    color: "text-galactic-green",
    border: "border-galactic-green",
    title: "Admin Oversight & Approval",
    desc: "Full moderation layer with individual and bulk approve/reject, profanity filters, copyright compliance tools, and a real-time activity timeline.",
  },
  {
    icon: Cpu,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    title: "AI Agentic Workflow Builder",
    desc: "10-step guided wizard: choose industry → content type → sources → timeline → destinations → AI mode → frequency → approval mode → review → launch.",
  },
  {
    icon: Filter,
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    title: "16 Advanced Filters",
    desc: "Keyword, hashtag, engagement, language, sentiment, region, follower count, NSFW, duplicate, AI quality score, virality prediction, and more.",
  },
  {
    icon: TrendingUp,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    title: "Viral Content Discovery",
    desc: "Real-time trend detection engine surfaces fast-growing hashtags, exploding niches, engagement spikes, and trending creators across platforms.",
  },
  {
    icon: Bot,
    color: "text-neon-purple",
    border: "border-neon-purple",
    title: "AI Virtual Assistant (JARVIS Mode)",
    desc: "Conversational AI assistant inside the dashboard recommends campaigns, suggests niches, explains analytics, and warns about low-quality content.",
  },
];

const industries = [
  "Fashion", "Cars", "Agriculture", "Technology", "Crypto", "Sports",
  "Entertainment", "Church", "Business", "Ecommerce", "Real Estate",
  "Motivation", "Luxury", "Education", "Gaming", "AI", "Finance",
  "Health", "Travel", "Food", "Beauty", "Podcasts", "News",
];

const workflowSteps = [
  { step: "01", label: "Select Industry", icon: Target },
  { step: "02", label: "Choose Content Types", icon: Layers },
  { step: "03", label: "Pick Source Platforms", icon: Globe2 },
  { step: "04", label: "Set Timeline", icon: RefreshCw },
  { step: "05", label: "Choose Destinations", icon: Share2 },
  { step: "06", label: "Select AI Mode", icon: Brain },
  { step: "07", label: "Set Frequency", icon: BarChart3 },
  { step: "08", label: "Approval Mode", icon: CheckCircle },
  { step: "09", label: "Review Campaign", icon: Filter },
  { step: "10", label: "Launch Automation", icon: Zap },
];

const useCases = [
  { label: "Social Media Managers", icon: Users },
  { label: "Fashion Brands", icon: Sparkles },
  { label: "Media Companies", icon: Rss },
  { label: "Ecommerce Brands", icon: Target },
  { label: "Churches & NGOs", icon: Globe2 },
  { label: "Tech Companies", icon: Cpu },
  { label: "Influencers", icon: TrendingUp },
  { label: "Affiliate Marketers", icon: BarChart3 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeatureSportaPage() {
  const [activeIndustry, setActiveIndustry] = useState(0);

  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>SPORTA – AI Social Media Aggregator & Publisher | TOBSEYTECH</title>
      <Navigation />

      <main className="pt-20">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden py-24 px-6">
          <div className="absolute inset-0 bg-gradient-to-br from-galactic-orange/5 via-neon-purple/5 to-neon-cyan/5 pointer-events-none" />
          <div className="container mx-auto max-w-5xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-6">
                <Zap className="w-4 h-4" /> Feature 18, SPORTA
              </div>
              <h1 className="font-orbitron font-black text-5xl md:text-7xl gradient-text mb-4 leading-tight">
                SPORTA
              </h1>
              <p className="text-xl md:text-2xl text-neon-cyan font-orbitron font-semibold mb-6">
                AI Agentic Social Media Aggregator, Reshaper &amp; Mass Publisher
              </p>
              <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed mb-10">
                An enterprise-grade automation platform that aggregates public content from 17+ platforms,
                reshapes it with AI, and mass-publishes to all your social channels and website, on autopilot.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                  { label: "Source Platforms", value: "17+" },
                  { label: "AI Modes", value: "10" },
                  { label: "Publish Destinations", value: "10" },
                  { label: "Filter Options", value: "16" },
                  { label: "Workflow Steps", value: "10" },
                  { label: "Industries", value: "25" },
                ].map(({ label, value }) => (
                  <div key={label} className="px-4 py-3 glass-effect rounded-xl border border-galactic-orange/20 text-center">
                    <div className="font-orbitron font-black text-galactic-orange text-2xl">{value}</div>
                    <div className="text-gray-400 text-xs font-orbitron whitespace-nowrap">{label}</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <Link href="/dashboard">
                  <Button className="bg-galactic-orange text-space-black font-orbitron font-bold px-8 h-12 text-sm hover:bg-galactic-gold shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all">
                    <Zap className="w-4 h-4 mr-2" /> Launch SPORTA
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange font-orbitron font-bold px-8 h-12 text-sm hover:bg-galactic-orange/10">
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
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-4">
                <Brain className="w-4 h-4" /> Core Capabilities
              </div>
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                Everything a Content Machine Needs
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                SPORTA is not a simple scraper, it's an AI-powered publishing ecosystem built for agencies, brands, and media companies.
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
                    className={`glass-effect p-6 rounded-2xl border ${cap.border}/20 hover:${cap.border}/40 transition-all group`}
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

        {/* ── 10-Step Workflow ── */}
        <section className="py-20 px-6 bg-space-dark/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 text-neon-purple text-sm font-orbitron mb-4">
                <Cpu className="w-4 h-4" /> AI Agentic Workflow
              </div>
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                10-Step Campaign Builder
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                A wizard-guided automation setup that takes you from zero to a fully-running content machine in minutes.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {workflowSteps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-effect p-5 rounded-2xl border border-galactic-orange/15 hover:border-galactic-orange/35 transition-all text-center group"
                  >
                    <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-galactic-orange" />
                    </div>
                    <span className="font-orbitron font-black text-galactic-orange/40 text-3xl block mb-1">{s.step}</span>
                    <p className="text-white text-xs font-semibold font-orbitron">{s.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Industries ── */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-gold/30 text-galactic-gold text-sm font-orbitron mb-4">
                <Target className="w-4 h-4" /> Industry Coverage
              </div>
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                25 Industries Supported
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                SPORTA ships with pre-configured intelligence for 25 industries, plus a "Custom" mode for anything else.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {industries.map((industry, i) => (
                <motion.button
                  key={industry}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setActiveIndustry(i)}
                  className={`px-4 py-2 rounded-xl border text-sm font-orbitron font-semibold transition-all ${
                    activeIndustry === i
                      ? "bg-galactic-orange text-space-black border-galactic-orange shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                      : "border-galactic-orange/20 text-gray-300 hover:border-galactic-orange/50 hover:text-white glass-effect"
                  }`}
                >
                  {industry}
                </motion.button>
              ))}
              <span className="px-4 py-2 rounded-xl border border-dashed border-galactic-orange/30 text-gray-500 text-sm font-orbitron">
                + Custom
              </span>
            </div>
          </div>
        </section>

        {/* ── Who It's For ── */}
        <section className="py-20 px-6 bg-space-dark/40">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="font-orbitron font-bold text-4xl gradient-text mb-4">
                Built for Professionals
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Whether you're a solo creator or an enterprise agency, SPORTA scales with you.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {useCases.map((uc, i) => {
                const Icon = uc.icon;
                return (
                  <motion.div
                    key={uc.label}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="glass-effect p-5 rounded-2xl border border-neon-cyan/15 hover:border-neon-cyan/35 text-center transition-all"
                  >
                    <Icon className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
                    <p className="text-white font-orbitron font-semibold text-sm">{uc.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Performance & Security ── */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-green/30 text-galactic-green text-sm font-orbitron mb-6">
                  <Zap className="w-4 h-4" /> Performance
                </div>
                <h2 className="font-orbitron font-bold text-3xl text-white mb-6">
                  Enterprise-Grade Speed
                </h2>
                <div className="space-y-3">
                  {[
                    "Background queue workers with BullMQ",
                    "Redis-backed caching layer",
                    "Parallel scraping architecture",
                    "WebSocket real-time updates",
                    "Automatic deduplication",
                    "Retry & failure handling",
                    "Horizontal scaling support",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-galactic-green flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 text-neon-purple text-sm font-orbitron mb-6">
                  <Shield className="w-4 h-4" /> Security
                </div>
                <h2 className="font-orbitron font-bold text-3xl text-white mb-6">
                  Security First
                </h2>
                <div className="space-y-3">
                  {[
                    "OAuth-based account connections",
                    "Rate limiting & anti-ban protection",
                    "Proxy rotation support",
                    "Full audit logs",
                    "RBAC role permissions",
                    "AI copyright compliance tools",
                    "NSFW & profanity filters",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-neon-purple flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-6 bg-gradient-to-b from-transparent to-space-dark/60">
          <div className="container mx-auto max-w-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.5)]">
              <Zap className="w-10 h-10 text-space-black" />
            </div>
            <h2 className="font-orbitron font-black text-4xl gradient-text mb-4">
              Ready to Automate?
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Launch your first SPORTA campaign from the admin dashboard and watch your content machine come alive.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/dashboard">
                <Button className="bg-galactic-orange text-space-black font-orbitron font-bold px-8 h-12 hover:bg-galactic-gold shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all">
                  <Play className="w-4 h-4 mr-2" /> Open Dashboard
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange font-orbitron font-bold px-8 h-12 hover:bg-galactic-orange/10">
                  Book a Demo <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Back nav ── */}
        <div className="container mx-auto px-6 py-10 text-center border-t border-galactic-orange/10">
          <Link href="/features">
            <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange font-orbitron text-xs hover:bg-galactic-orange/10">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back to All Features
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
