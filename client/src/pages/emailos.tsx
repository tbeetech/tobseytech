import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Zap,
  Loader2,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  Globe2,
  Layers,
  BarChart3,
  MousePointerClick,
  Users,
  FileText,
  Send,
  TrendingUp,
  FlaskConical,
  Clock,
  Plus,
  Trash2,
  RefreshCw,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tier = "starter" | "pro" | "enterprise";
type OnboardingStatus =
  | "pending"
  | "org_created"
  | "tier_selected"
  | "list_created"
  | "campaign_created"
  | "complete";

interface Org {
  _id: string;
  userId: string;
  orgName: string;
  orgDomain: string;
  tier: Tier;
  onboardingStatus: OnboardingStatus;
  contactsCount: number;
  emailsSentThisMonth: number;
  activeCampaignsCount: number;
  maxContacts: number;
  maxEmailsPerMonth: number;
  maxActiveCampaigns: number;
}

interface EmailList {
  _id: string;
  name: string;
  description?: string;
  contactCount: number;
}

interface Campaign {
  _id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  status: string;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  scheduledAt?: string;
  createdAt: string;
}

// ─── Tier definitions ────────────────────────────────────────────────────────

const TIER_DEFS = [
  {
    id: "starter" as Tier,
    name: "Starter",
    price: "Free",
    priceNote: "Forever",
    icon: Star,
    color: "text-galactic-green",
    border: "border-galactic-green",
    bg: "from-galactic-green/10 to-galactic-green/5",
    features: ["500 contacts", "1,000 emails/month", "1 active campaign", "3 starter templates", "Open tracking", "Community support"],
  },
  {
    id: "pro" as Tier,
    name: "Pro",
    price: "$29",
    priceNote: "/month",
    icon: Sparkles,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    bg: "from-neon-cyan/10 to-neon-cyan/5",
    badge: "Most Popular",
    features: ["10,000 contacts", "50,000 emails/month", "10 active campaigns", "All templates + AI generation", "Open & click tracking", "A/B split testing", "Priority support", "Custom domain"],
  },
  {
    id: "enterprise" as Tier,
    name: "Enterprise",
    price: "$99",
    priceNote: "/month",
    icon: Crown,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    bg: "from-galactic-orange/10 to-galactic-orange/5",
    badge: "Unlimited",
    features: ["Unlimited contacts", "Unlimited emails/month", "Unlimited campaigns", "Custom AI templates", "Full tracking & dedup", "Custom cron (1-min)", "White-label & API", "Dedicated SLA support"],
  },
];

// ─── Onboarding steps ────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  { id: "welcome",   label: "Welcome",      icon: Mail },
  { id: "org",       label: "Organisation", icon: Building2 },
  { id: "tier",      label: "Choose Plan",  icon: Layers },
  { id: "list",      label: "First List",   icon: Users },
  { id: "campaign",  label: "First Campaign",icon: Send },
  { id: "launch",    label: "Launch",       icon: Zap },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, { credentials: "include", ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-10 flex-wrap">
      {ONBOARDING_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-orbitron transition-all ${
                active
                  ? "bg-neon-cyan/20 border border-neon-cyan text-neon-cyan"
                  : done
                  ? "bg-galactic-green/10 border border-galactic-green/50 text-galactic-green"
                  : "border border-white/10 text-gray-500"
              }`}
            >
              {done ? <CheckCircle className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < ONBOARDING_STEPS.length - 1 && (
              <div className={`w-4 h-px mx-1 ${i < current ? "bg-galactic-green/50" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Onboarding Wizard ───────────────────────────────────────────────────────

function OnboardingWizard({ onComplete }: { onComplete: (org: Org) => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [org, setOrg] = useState<Org | null>(null);

  // Step 1 — org form
  const [orgName, setOrgName]     = useState("");
  const [orgDomain, setOrgDomain] = useState("");

  // Step 2 — tier
  const [selectedTier, setSelectedTier] = useState<Tier>("starter");

  // Step 3 — list
  const [listName, setListName]     = useState("");
  const [listDesc, setListDesc]     = useState("");
  const [lists, setLists]           = useState<EmailList[]>([]);

  // Step 4 — campaign
  const [campaignSubject, setCampaignSubject] = useState("");
  const [campaignFrom,    setCampaignFrom]    = useState("");
  const [campaignEmail,   setCampaignEmail]   = useState("");

  // ── step handlers ──

  async function handleOrgSubmit() {
    if (!orgName.trim() || !orgDomain.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/emailos/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName: orgName.trim(), orgDomain: orgDomain.trim() }),
      });
      setOrg(data);
      setStep(2);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleTierSelect(tier: Tier) {
    setSelectedTier(tier);
    setLoading(true);
    try {
      const data = await apiFetch("/api/emailos/org/tier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      setOrg(data);
      setStep(3);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleListCreate() {
    if (!listName.trim()) {
      toast({ title: "Please enter a list name", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch("/api/emailos/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: listName.trim(), description: listDesc.trim() || undefined }),
      });
      setLists([data]);
      setStep(4);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleListSkip() {
    try {
      const data = await apiFetch("/api/emailos/org/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStatus: "list_created" }),
      });
      setOrg(data);
    } catch { /* non-critical */ }
    setStep(4);
  }

  async function handleCampaignCreate() {
    if (!campaignSubject.trim() || !campaignFrom.trim() || !campaignEmail.trim()) {
      toast({ title: "Please fill in all campaign fields", variant: "destructive" });
      return;
    }
    if (!lists[0]?._id) {
      toast({ title: "Please create a list first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/api/emailos/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId:    lists[0]._id,
          subject:   campaignSubject.trim(),
          fromName:  campaignFrom.trim(),
          fromEmail: campaignEmail.trim(),
          htmlBody:  `<p>Hello, this is your first campaign from <strong>${campaignFrom.trim()}</strong>!</p>`,
        }),
      });
      setStep(5);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCampaignSkip() {
    try {
      const data = await apiFetch("/api/emailos/org/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStatus: "campaign_created" }),
      });
      setOrg(data);
    } catch { /* non-critical */ }
    setStep(5);
  }

  async function handleLaunch() {
    setLoading(true);
    try {
      const data = await apiFetch("/api/emailos/org/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingStatus: "complete" }),
      });
      onComplete(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-20 max-w-3xl">
        <StepIndicator current={step} />

        <AnimatePresence mode="wait">

          {/* ── Step 0: Welcome ── */}
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-effect p-10 rounded-3xl border border-neon-cyan/30 text-center">
              <div className="w-20 h-20 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-neon-cyan" />
              </div>
              <h1 className="font-orbitron font-black text-3xl gradient-text mb-3">Welcome to EmailOS</h1>
              <p className="text-gray-300 mb-2 max-w-lg mx-auto">
                Your <span className="text-neon-cyan font-semibold">multi-tenant email marketing operating system</span> is ready. Let's set up your organisation in under 2 minutes.
              </p>
              <p className="text-gray-500 text-sm mb-8 max-w-lg mx-auto">
                Contacts, campaigns, lists, and analytics — all scoped to your org with zero data bleed.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {["MongoDB-native","JWT Auth Bridge","SES Delivery","Cron Dispatch","A/B Testing"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-orbitron border border-neon-cyan/20 text-neon-cyan/70">{tag}</span>
                ))}
              </div>
              <Button onClick={() => setStep(1)} className="bg-neon-cyan text-space-black font-orbitron font-bold px-10 h-12 hover:bg-neon-cyan/80">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* ── Step 1: Org Setup ── */}
          {step === 1 && (
            <motion.div key="org" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-effect p-10 rounded-3xl border border-galactic-orange/30">
              <div className="flex items-center gap-3 mb-6">
                <Building2 className="w-8 h-8 text-galactic-orange" />
                <div>
                  <h2 className="font-orbitron font-bold text-2xl gradient-text">Set Up Your Organisation</h2>
                  <p className="text-gray-400 text-sm">This creates your isolated tenant namespace in MongoDB.</p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-orbitron text-gray-300 mb-2">Organisation Name *</label>
                  <input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="e.g. Acme Corp Newsletter"
                    className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-galactic-orange/60 font-orbitron text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-orbitron text-gray-300 mb-2">Sending Domain *</label>
                  <input
                    value={orgDomain}
                    onChange={e => setOrgDomain(e.target.value)}
                    placeholder="e.g. mail.acmecorp.com"
                    className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-galactic-orange/60 font-orbitron text-sm"
                  />
                  <p className="text-gray-500 text-xs mt-1">Used as the sending domain for your campaigns via Amazon SES.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="border-white/10 text-gray-400 font-orbitron">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleOrgSubmit} disabled={loading} className="flex-1 bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Choose Plan ── */}
          {step === 2 && (
            <motion.div key="tier" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-8 h-8 text-neon-purple" />
                <div>
                  <h2 className="font-orbitron font-bold text-2xl gradient-text">Choose Your Plan</h2>
                  <p className="text-gray-400 text-sm">You can upgrade or downgrade anytime.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {TIER_DEFS.map(tier => {
                  const Icon = tier.icon;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => !loading && handleTierSelect(tier.id)}
                      className={`glass-effect p-6 rounded-2xl border cursor-pointer transition-all relative ${
                        selectedTier === tier.id ? `${tier.border} shadow-[0_0_20px_rgba(6,182,212,0.15)]` : `${tier.border}/20 hover:${tier.border}/40`
                      }`}
                    >
                      {tier.badge && (
                        <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-orbitron font-bold bg-space-black border ${tier.border} ${tier.color}`}>
                          {tier.badge}
                        </div>
                      )}
                      <Icon className={`w-7 h-7 ${tier.color} mb-3`} />
                      <h3 className={`font-orbitron font-bold text-base ${tier.color} mb-1`}>{tier.name}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="font-orbitron font-black text-2xl text-white">{tier.price}</span>
                        <span className="text-gray-500 text-xs font-orbitron">{tier.priceNote}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {tier.features.slice(0, 4).map(f => (
                          <li key={f} className="flex items-center gap-1.5 text-xs text-gray-300">
                            <CheckCircle className={`w-3 h-3 ${tier.color} shrink-0`} />
                            {f}
                          </li>
                        ))}
                        {tier.features.length > 4 && (
                          <li className={`text-xs ${tier.color} font-orbitron`}>+{tier.features.length - 4} more</li>
                        )}
                      </ul>
                      {loading && selectedTier === tier.id && (
                        <div className="mt-3 flex justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" onClick={() => setStep(1)} className="border-white/10 text-gray-400 font-orbitron">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            </motion.div>
          )}

          {/* ── Step 3: Create First List ── */}
          {step === 3 && (
            <motion.div key="list" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-effect p-10 rounded-3xl border border-galactic-green/30">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-8 h-8 text-galactic-green" />
                <div>
                  <h2 className="font-orbitron font-bold text-2xl gradient-text">Create Your First List</h2>
                  <p className="text-gray-400 text-sm">A list is a segmented group of contacts. You can add contacts later.</p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-orbitron text-gray-300 mb-2">List Name *</label>
                  <input
                    value={listName}
                    onChange={e => setListName(e.target.value)}
                    placeholder="e.g. Weekly Newsletter Subscribers"
                    className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-galactic-green/60 font-orbitron text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-orbitron text-gray-300 mb-2">Description (optional)</label>
                  <input
                    value={listDesc}
                    onChange={e => setListDesc(e.target.value)}
                    placeholder="e.g. Subscribers who opted in via the blog signup form"
                    className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-galactic-green/60 font-orbitron text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleListSkip} className="border-white/10 text-gray-400 font-orbitron text-sm">
                  Skip for now
                </Button>
                <Button onClick={handleListCreate} disabled={loading} className="flex-1 bg-galactic-green text-space-black font-orbitron font-bold hover:bg-galactic-green/80">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Create List
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Create First Campaign ── */}
          {step === 4 && (
            <motion.div key="campaign" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="glass-effect p-10 rounded-3xl border border-neon-purple/30">
              <div className="flex items-center gap-3 mb-6">
                <Send className="w-8 h-8 text-neon-purple" />
                <div>
                  <h2 className="font-orbitron font-bold text-2xl gradient-text">Create Your First Campaign</h2>
                  <p className="text-gray-400 text-sm">A draft campaign you can edit and schedule later.</p>
                </div>
              </div>
              {lists.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-5 text-yellow-400 text-sm font-orbitron">
                  You skipped list creation — you'll need to add a list before sending.
                </div>
              )}
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-orbitron text-gray-300 mb-2">Subject Line *</label>
                  <input
                    value={campaignSubject}
                    onChange={e => setCampaignSubject(e.target.value)}
                    placeholder="e.g. 🚀 Your Weekly Dev Tips — Issue #1"
                    className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/60 font-orbitron text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-orbitron text-gray-300 mb-2">From Name *</label>
                    <input
                      value={campaignFrom}
                      onChange={e => setCampaignFrom(e.target.value)}
                      placeholder="e.g. The TOBSEYTECH Team"
                      className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/60 font-orbitron text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-orbitron text-gray-300 mb-2">From Email *</label>
                    <input
                      value={campaignEmail}
                      onChange={e => setCampaignEmail(e.target.value)}
                      placeholder="e.g. hello@yourdomain.com"
                      className="w-full bg-space-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-purple/60 font-orbitron text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCampaignSkip} className="border-white/10 text-gray-400 font-orbitron text-sm">
                  Skip for now
                </Button>
                <Button onClick={handleCampaignCreate} disabled={loading || lists.length === 0} className="flex-1 bg-neon-purple text-white font-orbitron font-bold hover:bg-neon-purple/80">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Create Campaign
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Launch ── */}
          {step === 5 && (
            <motion.div key="launch" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-effect p-10 rounded-3xl border border-galactic-orange/40 text-center">
              <div className="w-24 h-24 rounded-full bg-galactic-orange/15 border border-galactic-orange/40 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-12 h-12 text-galactic-orange" />
              </div>
              <h2 className="font-orbitron font-black text-3xl gradient-text mb-3">You're All Set! 🎉</h2>
              <p className="text-gray-300 mb-2 max-w-md mx-auto">
                Your EmailOS organisation is live. Head to your dashboard to manage contacts, design campaigns, and track performance.
              </p>
              <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
                All data is securely scoped to your organisation ID in MongoDB.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                {["Contacts Ready","Campaigns Ready","Tracking Active","SES Connected"].map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-orbitron border border-galactic-green/30 text-galactic-green">
                    <CheckCircle className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
              <Button onClick={handleLaunch} disabled={loading} className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold px-10 h-12 hover:opacity-90">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                Enter Dashboard
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function EmailOSDashboard({ org: initialOrg }: { org: Org }) {
  const { toast } = useToast();
  const [org, setOrg]                 = useState(initialOrg);
  const [campaigns, setCampaigns]     = useState<Campaign[]>([]);
  const [lists, setLists]             = useState<EmailList[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab]     = useState<"overview" | "campaigns" | "lists" | "settings">("overview");

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      try {
        const [campsData, listsData] = await Promise.all([
          apiFetch("/api/emailos/campaigns"),
          apiFetch("/api/emailos/lists"),
        ]);
        setCampaigns(campsData);
        setLists(listsData);
      } catch { /* silently ignore */ }
      setLoadingData(false);
    }
    load();
  }, []);

  const tierDef = TIER_DEFS.find(t => t.id === org.tier)!;

  const tabs = [
    { id: "overview",  label: "Overview",  icon: BarChart3 },
    { id: "campaigns", label: "Campaigns", icon: Send },
    { id: "lists",     label: "Lists",     icon: Users },
    { id: "settings",  label: "Settings",  icon: Building2 },
  ] as const;

  async function handleUpgradeTier(tier: Tier) {
    try {
      const data = await apiFetch("/api/emailos/org/tier", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      setOrg(data);
      toast({ title: `Plan updated to ${tier}!` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  async function handleDeleteCampaign(id: string) {
    try {
      await apiFetch(`/api/emailos/campaigns/${id}`, { method: "DELETE" });
      setCampaigns(prev => prev.filter(c => c._id !== id));
      toast({ title: "Campaign deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-7xl">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-neon-cyan" />
            <div>
              <h1 className="text-3xl font-orbitron font-bold gradient-text">{org.orgName}</h1>
              <p className="text-gray-400 text-sm">{org.orgDomain}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${tierDef.border}/40 ${tierDef.color} glass-effect`}>
            {(() => { const Icon = tierDef.icon; return <Icon className="w-4 h-4" />; })()}
            <span className="font-orbitron font-bold text-sm">{tierDef.name} Plan</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-space-dark/60 rounded-xl border border-white/10 w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-orbitron transition-all ${
                  activeTab === tab.id
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {loadingData && activeTab !== "settings" ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-neon-cyan" />
          </div>
        ) : (
          <>
            {/* ── Overview ── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Contacts",           value: org.contactsCount,         max: org.maxContacts,          icon: Users,           color: "text-galactic-green",  barColor: "bg-galactic-green"  },
                    { label: "Emails This Month",  value: org.emailsSentThisMonth,   max: org.maxEmailsPerMonth,    icon: Send,            color: "text-neon-cyan",       barColor: "bg-neon-cyan"       },
                    { label: "Active Campaigns",   value: org.activeCampaignsCount, max: org.maxActiveCampaigns,   icon: RefreshCw,       color: "text-galactic-orange", barColor: "bg-galactic-orange" },
                    { label: "Total Lists",        value: lists.length,              max: null,                     icon: Layers,          color: "text-neon-purple",     barColor: "bg-neon-purple"     },
                  ].map(stat => {
                    const Icon = stat.icon;
                    const pct = stat.max ? Math.min(100, Math.round((stat.value / stat.max) * 100)) : null;
                    return (
                      <div key={stat.label} className="glass-effect p-5 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                          {pct !== null && (
                            <span className={`text-xs font-orbitron ${pct > 80 ? "text-red-400" : "text-gray-500"}`}>{pct}%</span>
                          )}
                        </div>
                        <div className={`font-orbitron font-black text-2xl ${stat.color} mb-1`}>
                          {stat.value.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-xs font-orbitron">{stat.label}</div>
                        {stat.max && (
                          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct! > 80 ? "bg-red-500" : stat.barColor}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Plan info */}
                <div className={`glass-effect p-6 rounded-2xl border ${tierDef.border}/20`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-orbitron font-bold text-sm text-white">Current Plan: {tierDef.name}</h3>
                    {org.tier !== "enterprise" && (
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("settings")}
                        className={`bg-gradient-to-r ${tierDef.bg} border ${tierDef.border}/40 ${tierDef.color} font-orbitron text-xs hover:opacity-80`}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" /> Upgrade
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`font-orbitron font-black text-lg ${tierDef.color}`}>
                        {org.maxContacts >= 999_999_999 ? "∞" : org.maxContacts.toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-xs font-orbitron">Max Contacts</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-orbitron font-black text-lg ${tierDef.color}`}>
                        {org.maxEmailsPerMonth >= 999_999_999 ? "∞" : org.maxEmailsPerMonth.toLocaleString()}
                      </div>
                      <div className="text-gray-500 text-xs font-orbitron">Emails / Month</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-orbitron font-black text-lg ${tierDef.color}`}>
                        {org.maxActiveCampaigns >= 999 ? "∞" : org.maxActiveCampaigns}
                      </div>
                      <div className="text-gray-500 text-xs font-orbitron">Active Campaigns</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Campaigns ── */}
            {activeTab === "campaigns" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-orbitron font-bold text-lg text-white">Campaigns ({campaigns.length})</h2>
                  <Link href="/emailos">
                    <Button size="sm" className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-orbitron text-xs hover:bg-neon-cyan/30">
                      <Plus className="w-3 h-3 mr-1" /> New Campaign
                    </Button>
                  </Link>
                </div>
                {campaigns.length === 0 ? (
                  <div className="glass-effect p-10 rounded-2xl border border-white/10 text-center">
                    <Send className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-orbitron text-sm">No campaigns yet. Create your first one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map(c => (
                      <div key={c._id} className="glass-effect p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-orbitron font-bold text-sm text-white truncate">{c.subject}</p>
                          <p className="text-gray-500 text-xs font-orbitron">{c.fromName} &lt;{c.fromEmail}&gt;</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-orbitron text-gray-400">
                          <span className={`px-2 py-0.5 rounded-full border ${
                            c.status === "sent" ? "border-galactic-green/40 text-galactic-green" :
                            c.status === "scheduled" ? "border-neon-cyan/40 text-neon-cyan" :
                            c.status === "sending" ? "border-galactic-orange/40 text-galactic-orange" :
                            "border-white/10 text-gray-500"
                          }`}>{c.status}</span>
                          <span><MousePointerClick className="w-3 h-3 inline mr-1" />{c.totalOpens} opens</span>
                          <span><TrendingUp className="w-3 h-3 inline mr-1" />{c.totalClicks} clicks</span>
                          <button onClick={() => handleDeleteCampaign(c._id)} className="text-red-500/60 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Lists ── */}
            {activeTab === "lists" && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-orbitron font-bold text-lg text-white">Email Lists ({lists.length})</h2>
                </div>
                {lists.length === 0 ? (
                  <div className="glass-effect p-10 rounded-2xl border border-white/10 text-center">
                    <Users className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 font-orbitron text-sm">No lists yet.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lists.map(list => (
                      <div key={list._id} className="glass-effect p-5 rounded-2xl border border-white/10">
                        <Users className="w-5 h-5 text-galactic-green mb-3" />
                        <h3 className="font-orbitron font-bold text-sm text-white mb-1">{list.name}</h3>
                        {list.description && <p className="text-gray-500 text-xs mb-3">{list.description}</p>}
                        <div className="font-orbitron font-black text-galactic-green text-xl">
                          {list.contactCount.toLocaleString()}
                          <span className="text-gray-500 text-xs ml-1">contacts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Settings / Upgrade ── */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="glass-effect p-6 rounded-2xl border border-white/10">
                  <h2 className="font-orbitron font-bold text-lg text-white mb-1">Organisation</h2>
                  <p className="text-gray-400 text-sm mb-4">Your organisation details.</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 font-orbitron text-xs mb-1">Name</div>
                      <div className="text-white font-orbitron">{org.orgName}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-orbitron text-xs mb-1">Domain</div>
                      <div className="text-white font-orbitron">{org.orgDomain}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="font-orbitron font-bold text-lg text-white mb-4">Change Plan</h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {TIER_DEFS.map(tier => {
                      const Icon = tier.icon;
                      const isCurrent = org.tier === tier.id;
                      return (
                        <div key={tier.id} className={`glass-effect p-6 rounded-2xl border ${isCurrent ? tier.border : `${tier.border}/20`} relative`}>
                          {isCurrent && (
                            <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-orbitron font-bold bg-space-black border ${tier.border} ${tier.color}`}>
                              Current
                            </div>
                          )}
                          <Icon className={`w-6 h-6 ${tier.color} mb-3`} />
                          <h3 className={`font-orbitron font-bold text-base ${tier.color} mb-1`}>{tier.name}</h3>
                          <div className="flex items-baseline gap-1 mb-4">
                            <span className="font-orbitron font-black text-2xl text-white">{tier.price}</span>
                            <span className="text-gray-500 text-xs font-orbitron">{tier.priceNote}</span>
                          </div>
                          <ul className="space-y-1.5 mb-5">
                            {tier.features.slice(0, 5).map(f => (
                              <li key={f} className="flex items-center gap-1.5 text-xs text-gray-300">
                                <CheckCircle className={`w-3 h-3 ${tier.color} shrink-0`} />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Button
                            onClick={() => !isCurrent && handleUpgradeTier(tier.id)}
                            disabled={isCurrent}
                            className={`w-full font-orbitron text-xs ${isCurrent ? "opacity-40 cursor-default" : ""} bg-gradient-to-r ${tier.bg} border ${tier.border}/40 text-white hover:opacity-80`}
                          >
                            {isCurrent ? "Current Plan" : tier.id === "enterprise" ? "Contact Sales" : `Switch to ${tier.name}`}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function EmailOSPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [org, setOrg]           = useState<Org | null>(null);
  const [checkingOrg, setCheckingOrg] = useState(true);

  useEffect(() => {
    if (!user) { setCheckingOrg(false); return; }
    apiFetch("/api/emailos/org")
      .then(data => setOrg(data))
      .catch(() => setOrg(null))
      .finally(() => setCheckingOrg(false));
  }, [user]);

  // Loading
  if (isLoading || checkingOrg) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-cyan" />
      </div>
    );
  }

  // Not logged in — prompt to create an account
  if (!user) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-24 pb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-effect rounded-3xl border border-neon-cyan/30 overflow-hidden"
          >
            {/* Top colour bar */}
            <div className="h-1.5 bg-gradient-to-r from-neon-cyan via-galactic-orange to-neon-purple" />

            <div className="p-10 text-center">
              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-10 h-10 text-neon-cyan" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/20 text-neon-cyan text-xs font-orbitron mb-4">
                <Zap className="w-3 h-3" /> EmailOS — SaaS Product #2
              </div>

              <h1 className="font-orbitron font-black text-3xl md:text-4xl gradient-text mb-3">
                Create a Free Account to Access EmailOS
              </h1>
              <p className="text-gray-300 max-w-lg mx-auto mb-2 leading-relaxed">
                EmailOS is your personal multi-tenant email marketing operating system.
                Every account gets its own isolated organisation in MongoDB — contacts, campaigns,
                and analytics with <span className="text-neon-cyan font-semibold">zero data bleed</span>.
              </p>
              <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
                Sign up in under 30 seconds. No credit card required. Your Starter plan is free forever.
              </p>

              {/* What you get */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 text-left">
                {[
                  { icon: Users,           label: "500 free contacts" },
                  { icon: Send,            label: "1,000 emails/mo free" },
                  { icon: MousePointerClick, label: "Open & click tracking" },
                  { icon: Layers,          label: "Email list management" },
                  { icon: RefreshCw,       label: "Cron-driven dispatch" },
                  { icon: CheckCircle,     label: "MongoDB-synced org" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 glass-effect rounded-xl border border-white/10 text-sm text-gray-300">
                    <Icon className="w-4 h-4 text-neon-cyan shrink-0" />
                    <span className="font-orbitron text-xs">{label}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth?redirect=/emailos&tab=register">
                  <Button className="w-full sm:w-auto bg-neon-cyan text-space-black font-orbitron font-bold px-8 h-12 hover:bg-neon-cyan/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                    <Zap className="w-4 h-4 mr-2" /> Create Free Account
                  </Button>
                </Link>
                <Link href="/auth?redirect=/emailos">
                  <Button variant="outline" className="w-full sm:w-auto border-neon-cyan/40 text-neon-cyan font-orbitron h-12 px-8 hover:bg-neon-cyan/10 transition-all">
                    Sign In
                  </Button>
                </Link>
              </div>

              <p className="text-gray-600 text-xs mt-5 font-orbitron">
                By creating an account you agree to our Terms of Service. Your EmailOS organisation
                is created in MongoDB and linked exclusively to your user account.
              </p>
            </div>
          </motion.div>

          {/* Mini feature reminder */}
          <div className="mt-6 text-center">
            <Link href="/feature/emailos">
              <span className="text-gray-500 text-xs font-orbitron hover:text-neon-cyan transition-colors underline underline-offset-2 cursor-pointer">
                Learn more about EmailOS →
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Onboarding not complete
  if (!org || org.onboardingStatus !== "complete") {
    return <OnboardingWizard onComplete={setOrg} />;
  }

  // Dashboard
  return <EmailOSDashboard org={org} />;
}
