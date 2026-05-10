import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Globe2,
  Brain,
  Share2,
  BarChart3,
  Filter,
  Shield,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Target,
  Layers,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Eye,
  Plus,
} from "lucide-react";
import type {
  SportaCampaign,
  SportaContent,
  SportaIndustry,
  SportaContentType,
  SportaPlatform,
  SportaPublishingDestination,
  SportaAiMode,
  SportaApprovalMode,
} from "../../../shared/schema";

// ─── Constants ────────────────────────────────────────────────────────────────

const INDUSTRIES: SportaIndustry[] = [
  "Fashion", "Cars", "Agriculture", "Technology", "Crypto", "Sports",
  "Politics", "Entertainment", "Church", "Business", "Ecommerce",
  "Real Estate", "Motivation", "Luxury", "Education", "Gaming", "AI",
  "Finance", "Health", "Travel", "Food", "Beauty", "Podcasts", "News", "Custom",
];

const CONTENT_TYPES: SportaContentType[] = [
  "Videos", "Shorts", "Reels", "Articles", "Threads", "Podcasts",
  "Memes", "Images", "Quotes", "Tutorials", "Reviews",
];

const PLATFORMS: SportaPlatform[] = [
  "Facebook", "Instagram", "X/Twitter", "TikTok", "YouTube", "Reddit",
  "LinkedIn", "Pinterest", "Threads", "Telegram", "RSS", "Medium",
  "Dev.to", "Vimeo", "Dailymotion",
];

const PUBLISHING_DESTINATIONS: SportaPublishingDestination[] = [
  "Facebook", "Instagram", "TikTok", "X", "LinkedIn", "Pinterest",
  "YouTube Community", "Telegram", "Website Blog", "Website Vlog",
];

const AI_MODES: SportaAiMode[] = [
  "Light Rewrite", "Full Rewrite", "Summary", "Expand", "Social Caption",
  "Blog Article", "Newsletter", "Thread", "SEO Optimized", "Viral Optimized",
];

const APPROVAL_MODES: { value: SportaApprovalMode; label: string }[] = [
  { value: "manual", label: "Manual Approval" },
  { value: "semi_automatic", label: "Semi-Automatic" },
  { value: "fully_automatic", label: "Fully Automatic" },
];

const TIMELINE_OPTIONS = [
  "Last 1 hour", "Today", "Last 24 hours", "Last week",
  "Trending now", "Viral this month", "Evergreen content",
];

const FREQUENCY_OPTIONS = [
  "Every 30 minutes", "Hourly", "Every 3 hours", "Every 6 hours",
  "Twice daily", "Daily", "Weekly",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface SportaStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingContent: number;
  publishedContent: number;
  rejectedContent: number;
}

interface WizardData {
  name: string;
  industry: SportaIndustry | "";
  contentTypes: SportaContentType[];
  sourcePlatforms: SportaPlatform[];
  publishingDestinations: SportaPublishingDestination[];
  aiMode: SportaAiMode | "";
  approvalMode: SportaApprovalMode;
  timelinePreference: string;
  postingFrequency: string;
  keywords: string;
  bannedKeywords: string;
  hashtags: string;
  enableSeo: boolean;
  enableViral: boolean;
  enableNsfwFilter: boolean;
  enableDuplicateFilter: boolean;
}

const defaultWizard: WizardData = {
  name: "",
  industry: "",
  contentTypes: [],
  sourcePlatforms: [],
  publishingDestinations: [],
  aiMode: "",
  approvalMode: "manual",
  timelinePreference: "Last 24 hours",
  postingFrequency: "Daily",
  keywords: "",
  bannedKeywords: "",
  hashtags: "",
  enableSeo: true,
  enableViral: false,
  enableNsfwFilter: true,
  enableDuplicateFilter: true,
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    stopped: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-400 border-green-500/30",
    rejected: "bg-red-500/20 text-red-400 border-red-500/30",
    published: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return (
    <Badge className={`${map[status] ?? "bg-white/10 text-gray-300 border-white/20"} text-xs capitalize`}>
      {status}
    </Badge>
  );
}

function ScoreBar({ value, color }: { value?: number; color: string }) {
  if (value === undefined) return <span className="text-gray-500 text-xs">—</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-7 text-right">{value}</span>
    </div>
  );
}

function MultiSelectGrid<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-gray-400 text-xs font-orbitron mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-semibold border transition-all ${
                active
                  ? "bg-galactic-orange text-space-black border-galactic-orange"
                  : "border-galactic-orange/20 text-gray-400 hover:border-galactic-orange/50 hover:text-white glass-effect"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Wizard Component ─────────────────────────────────────────────────────────

function CampaignWizard({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(defaultWizard);

  const set = <K extends keyof WizardData>(key: K, val: WizardData[K]) =>
    setData((prev) => ({ ...prev, [key]: val }));

  const toggle = <T extends string>(key: "contentTypes" | "sourcePlatforms" | "publishingDestinations", val: T) => {
    setData((prev) => {
      const arr = prev[key] as T[];
      return { ...prev, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
    });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: data.name || `SPORTA Campaign – ${data.industry}`,
        industry: data.industry,
        contentTypes: data.contentTypes,
        sourcePlatforms: data.sourcePlatforms,
        publishingDestinations: data.publishingDestinations,
        aiMode: data.aiMode,
        approvalMode: data.approvalMode,
        timelinePreference: data.timelinePreference,
        postingFrequency: data.postingFrequency,
        keywords: data.keywords.split(",").map((s) => s.trim()).filter(Boolean),
        bannedKeywords: data.bannedKeywords.split(",").map((s) => s.trim()).filter(Boolean),
        hashtags: data.hashtags.split(",").map((s) => s.trim()).filter(Boolean),
        languages: ["English"],
        tone: "professional",
        audience: "general",
        enableSeo: data.enableSeo,
        enableViral: data.enableViral,
        enableNsfwFilter: data.enableNsfwFilter,
        enableDuplicateFilter: data.enableDuplicateFilter,
        minEngagement: 0,
        creatorId: user?.id ?? "admin",
      };
      const res = await apiRequest("POST", "/api/sporta/campaigns", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign created!", description: "Your SPORTA automation is ready." });
      onComplete();
    },
    onError: (err: any) => {
      toast({ title: "Failed to create campaign", description: err.message, variant: "destructive" });
    },
  });

  const canNext = () => {
    if (step === 1) return !!data.industry;
    if (step === 2) return data.contentTypes.length > 0;
    if (step === 3) return data.sourcePlatforms.length > 0;
    if (step === 5) return data.publishingDestinations.length > 0;
    if (step === 6) return !!data.aiMode;
    return true;
  };

  const stepLabels = [
    "Industry", "Content Types", "Source Platforms", "Timeline",
    "Destinations", "AI Mode", "Frequency", "Approval", "Review", "Launch",
  ];

  return (
    <div className="glass-effect rounded-2xl p-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-galactic-orange" />
          <h2 className="text-lg font-orbitron font-bold text-galactic-orange">
            Campaign Wizard
          </h2>
        </div>
        <span className="text-xs text-gray-400 font-orbitron">Step {step} of 10</span>
      </div>

      {/* Step pills */}
      <div className="flex gap-1 mb-8 overflow-x-auto pb-1">
        {stepLabels.map((label, i) => (
          <div
            key={label}
            className={`flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-orbitron font-semibold transition-all ${
              i + 1 === step
                ? "bg-galactic-orange text-space-black"
                : i + 1 < step
                ? "bg-galactic-orange/30 text-galactic-orange"
                : "bg-white/5 text-gray-500"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[220px]">
        {step === 1 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Select Your Industry</h3>
            <p className="text-gray-400 text-sm mb-4">SPORTA will optimise content discovery and AI reshaping for your niche.</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => set("industry", ind)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-orbitron font-semibold border transition-all ${
                    data.industry === ind
                      ? "bg-galactic-orange text-space-black border-galactic-orange shadow-[0_0_12px_rgba(255,165,0,0.3)]"
                      : "border-galactic-orange/20 text-gray-400 hover:border-galactic-orange/50 glass-effect"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Select Content Types</h3>
            <p className="text-gray-400 text-sm mb-4">What kinds of content should SPORTA look for and republish?</p>
            <MultiSelectGrid
              label="Choose all that apply"
              options={CONTENT_TYPES}
              selected={data.contentTypes}
              onToggle={(v) => toggle("contentTypes", v)}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Select Source Platforms</h3>
            <p className="text-gray-400 text-sm mb-4">Which platforms should SPORTA aggregate public content from?</p>
            <MultiSelectGrid
              label="Select source platforms"
              options={PLATFORMS}
              selected={data.sourcePlatforms}
              onToggle={(v) => toggle("sourcePlatforms", v)}
            />
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Timeline Preference</h3>
            <p className="text-gray-400 text-sm mb-4">How recent should aggregated content be?</p>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("timelinePreference", opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-orbitron font-semibold border transition-all ${
                    data.timelinePreference === opt
                      ? "bg-neon-cyan text-space-black border-neon-cyan"
                      : "border-neon-cyan/20 text-gray-400 hover:border-neon-cyan/50 glass-effect"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <div>
                <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Keywords to target (comma-separated)</Label>
                <Input
                  value={data.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="AI, automation, startup..."
                  className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
                />
              </div>
              <div>
                <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Banned keywords (comma-separated)</Label>
                <Input
                  value={data.bannedKeywords}
                  onChange={(e) => set("bannedKeywords", e.target.value)}
                  placeholder="spam, nsfw..."
                  className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Publishing Destinations</h3>
            <p className="text-gray-400 text-sm mb-4">Where should SPORTA publish the reshaped content?</p>
            <MultiSelectGrid
              label="Select publishing destinations"
              options={PUBLISHING_DESTINATIONS}
              selected={data.publishingDestinations}
              onToggle={(v) => toggle("publishingDestinations", v)}
            />
          </div>
        )}

        {step === 6 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">AI Transformation Mode</h3>
            <p className="text-gray-400 text-sm mb-4">How should the AI reshape and republish content?</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {AI_MODES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => set("aiMode", mode)}
                  className={`px-3 py-2 rounded-xl text-xs font-orbitron font-semibold border transition-all ${
                    data.aiMode === mode
                      ? "bg-neon-purple text-white border-neon-purple shadow-[0_0_12px_rgba(139,92,246,0.4)]"
                      : "border-neon-purple/20 text-gray-400 hover:border-neon-purple/50 glass-effect"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400 font-orbitron text-xs">SEO Optimisation</Label>
                <Switch checked={data.enableSeo} onCheckedChange={(v) => set("enableSeo", v)} className="data-[state=checked]:bg-galactic-orange" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-gray-400 font-orbitron text-xs">Viral Optimisation</Label>
                <Switch checked={data.enableViral} onCheckedChange={(v) => set("enableViral", v)} className="data-[state=checked]:bg-galactic-orange" />
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Posting Frequency</h3>
            <p className="text-gray-400 text-sm mb-4">How often should SPORTA publish content?</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("postingFrequency", opt)}
                  className={`px-3 py-2 rounded-xl text-xs font-orbitron font-semibold border transition-all ${
                    data.postingFrequency === opt
                      ? "bg-galactic-green text-space-black border-galactic-green"
                      : "border-galactic-green/20 text-gray-400 hover:border-galactic-green/50 glass-effect"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div>
              <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Preferred Hashtags (comma-separated)</Label>
              <Input
                value={data.hashtags}
                onChange={(e) => set("hashtags", e.target.value)}
                placeholder="#tech, #ai, #startup..."
                className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Label className="text-gray-400 font-orbitron text-xs">NSFW Filter</Label>
              <Switch checked={data.enableNsfwFilter} onCheckedChange={(v) => set("enableNsfwFilter", v)} className="data-[state=checked]:bg-galactic-orange" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Label className="text-gray-400 font-orbitron text-xs">Duplicate Content Filter</Label>
              <Switch checked={data.enableDuplicateFilter} onCheckedChange={(v) => set("enableDuplicateFilter", v)} className="data-[state=checked]:bg-galactic-orange" />
            </div>
          </div>
        )}

        {step === 8 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-1">Approval Mode</h3>
            <p className="text-gray-400 text-sm mb-4">How much human oversight should SPORTA require before publishing?</p>
            <div className="space-y-3">
              {APPROVAL_MODES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    data.approvalMode === value
                      ? "border-galactic-orange bg-galactic-orange/10"
                      : "border-white/10 hover:border-galactic-orange/30 glass-effect"
                  }`}
                >
                  <input
                    type="radio"
                    value={value}
                    checked={data.approvalMode === value}
                    onChange={() => set("approvalMode", value)}
                    className="accent-galactic-orange"
                  />
                  <div>
                    <p className="text-white font-orbitron font-semibold text-sm">{label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {value === "manual" && "Every post requires your manual approval before publishing."}
                      {value === "semi_automatic" && "High-quality posts (AI score ≥ 80) are auto-approved; others queued for review."}
                      {value === "fully_automatic" && "All posts are published automatically. Fastest option — use with care."}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 9 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-4">Campaign Summary</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Name", value: data.name || `SPORTA – ${data.industry}` },
                { label: "Industry", value: data.industry },
                { label: "Content Types", value: data.contentTypes.join(", ") || "—" },
                { label: "Source Platforms", value: data.sourcePlatforms.slice(0, 4).join(", ") + (data.sourcePlatforms.length > 4 ? "..." : "") || "—" },
                { label: "Publishing To", value: data.publishingDestinations.slice(0, 4).join(", ") + (data.publishingDestinations.length > 4 ? "..." : "") || "—" },
                { label: "AI Mode", value: data.aiMode || "—" },
                { label: "Timeline", value: data.timelinePreference },
                { label: "Frequency", value: data.postingFrequency },
                { label: "Approval", value: APPROVAL_MODES.find((m) => m.value === data.approvalMode)?.label ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-gray-500 font-orbitron text-xs w-32 flex-shrink-0">{label}:</span>
                  <span className="text-white text-xs flex-1">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Campaign Name (optional)</Label>
              <Input
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={`SPORTA – ${data.industry || "My Campaign"}`}
                className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
              />
            </div>
          </div>
        )}

        {step === 10 && (
          <div className="text-center py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,165,0,0.4)]">
              <Zap className="w-10 h-10 text-space-black" />
            </div>
            <h3 className="font-orbitron font-bold text-white text-xl mb-2">Ready to Launch!</h3>
            <p className="text-gray-400 text-sm mb-6">
              Your SPORTA campaign "<strong className="text-white">{data.name || `SPORTA – ${data.industry}`}</strong>" is configured and ready.
              Click <strong className="text-galactic-orange">Launch</strong> to activate it.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-galactic-orange/10 border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron">
              <CheckCircle className="w-4 h-4" /> All systems go
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (step === 1 ? onCancel() : setStep((s) => s - 1))}
          className="text-gray-400 hover:text-white font-orbitron text-xs"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < 10 ? (
          <Button
            size="sm"
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold disabled:opacity-40"
          >
            Next <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold shadow-[0_0_20px_rgba(255,165,0,0.3)]"
          >
            {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
            Launch Campaign
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Content Queue Panel ──────────────────────────────────────────────────────

function ContentQueuePanel({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery<SportaContent[]>({
    queryKey: [`/api/sporta/campaigns/${campaignId}/content`],
    queryFn: async () => {
      const res = await fetch(`/api/sporta/campaigns/${campaignId}/content`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/sporta/content/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sporta/campaigns/${campaignId}/content`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sporta/stats"] });
      toast({ title: "Content status updated" });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const reshapeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/sporta/content/${id}/reshape`, { tone: "professional", aiMode: "Full Rewrite" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sporta/campaigns/${campaignId}/content`] });
      toast({ title: "AI reshape complete!" });
    },
    onError: (err: any) => toast({ title: "AI reshape failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/sporta/content/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sporta/campaigns/${campaignId}/content`] });
      toast({ title: "Content item deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-galactic-orange" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">
          Content queue for <span className="text-white font-semibold">{campaignName}</span>
        </p>
        <Button size="sm" variant="ghost" onClick={() => refetch()} className="text-galactic-orange hover:text-galactic-gold h-7 w-7 p-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-galactic-orange/20" />
          <p className="text-sm">No content in queue yet.</p>
          <p className="text-xs text-gray-600 mt-1">Content will appear here once SPORTA starts aggregating.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-space-dark rounded-xl p-4 border border-white/5 hover:border-galactic-orange/20 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className="bg-white/10 text-gray-300 border-white/10 text-[10px]">{item.sourcePlatform}</Badge>
                    <Badge className="bg-white/10 text-gray-300 border-white/10 text-[10px]">{item.mediaType}</Badge>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-white text-sm font-semibold truncate">
                    {item.aiRewrittenTitle ?? item.originalTitle ?? "Untitled"}
                  </p>
                  {item.aiRewrittenContent && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{item.aiRewrittenContent}</p>
                  )}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                    <div>
                      <p className="text-gray-600 text-[10px] mb-0.5">Quality</p>
                      <ScoreBar value={item.aiQualityScore} color="bg-galactic-green" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-[10px] mb-0.5">Viral</p>
                      <ScoreBar value={item.aiViralScore} color="bg-galactic-orange" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-[10px] mb-0.5">Engagement</p>
                      <ScoreBar value={item.aiEngagementPrediction} color="bg-neon-cyan" />
                    </div>
                    <div>
                      <p className="text-gray-600 text-[10px] mb-0.5">Confidence</p>
                      <ScoreBar value={item.aiConfidenceScore} color="bg-neon-purple" />
                    </div>
                  </div>
                  {item.aiGeneratedHashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.aiGeneratedHashtags.slice(0, 5).map((tag) => (
                        <span key={tag} className="text-neon-cyan text-[10px]">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  {item.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: item.id, status: "approved" })}
                        disabled={statusMutation.isPending}
                        className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 h-7 px-2 text-xs font-orbitron"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => statusMutation.mutate({ id: item.id, status: "rejected" })}
                        disabled={statusMutation.isPending}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 h-7 px-2 text-xs font-orbitron"
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                  {item.status === "approved" && (
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: item.id, status: "published" })}
                      disabled={statusMutation.isPending}
                      className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 h-7 px-2 text-xs font-orbitron"
                    >
                      <Share2 className="w-3 h-3 mr-1" /> Publish
                    </Button>
                  )}
                  {!item.aiRewrittenContent && (
                    <Button
                      size="sm"
                      onClick={() => reshapeMutation.mutate(item.id)}
                      disabled={reshapeMutation.isPending}
                      className="bg-neon-purple/20 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/30 h-7 px-2 text-xs font-orbitron"
                    >
                      {reshapeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                      {reshapeMutation.isPending ? "" : "AI"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm("Delete this content item?")) deleteMutation.mutate(item.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="text-red-400 hover:text-red-300 h-7 px-2"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SportaTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showWizard, setShowWizard] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Stats
  const { data: stats, refetch: refetchStats } = useQuery<SportaStats>({
    queryKey: ["/api/sporta/stats"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  // Campaigns
  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery<SportaCampaign[]>({
    queryKey: ["/api/sporta/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/campaigns", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/sporta/campaigns/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      refetchCampaigns();
      refetchStats();
      toast({ title: "Campaign updated" });
    },
    onError: () => toast({ title: "Failed to update campaign", variant: "destructive" }),
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/sporta/campaigns/${id}`);
      return res.json();
    },
    onSuccess: () => {
      refetchCampaigns();
      refetchStats();
      if (selectedCampaignId) setSelectedCampaignId(null);
      toast({ title: "Campaign deleted" });
    },
    onError: () => toast({ title: "Failed to delete campaign", variant: "destructive" }),
  });

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  if (showWizard) {
    return (
      <CampaignWizard
        onComplete={() => {
          setShowWizard(false);
          refetchCampaigns();
          refetchStats();
        }}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  if (selectedCampaign) {
    return (
      <div>
        {/* Campaign header */}
        <div className="glass-effect rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedCampaignId(null)}
                className="text-gray-400 hover:text-white h-7 px-2 font-orbitron text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Campaigns
              </Button>
              <span className="text-galactic-orange/40">|</span>
              <h2 className="text-lg font-orbitron font-bold text-galactic-orange">{selectedCampaign.name}</h2>
              <StatusBadge status={selectedCampaign.status} />
            </div>
            <div className="flex items-center gap-2">
              {selectedCampaign.status === "active" ? (
                <Button
                  size="sm"
                  onClick={() => toggleStatusMutation.mutate({ id: selectedCampaign.id, status: "paused" })}
                  disabled={toggleStatusMutation.isPending}
                  className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 h-8 px-3 text-xs font-orbitron"
                >
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => toggleStatusMutation.mutate({ id: selectedCampaign.id, status: "active" })}
                  disabled={toggleStatusMutation.isPending}
                  className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 h-8 px-3 text-xs font-orbitron"
                >
                  <Play className="w-3 h-3 mr-1" /> Activate
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { if (confirm(`Delete "${selectedCampaign.name}"?`)) deleteCampaignMutation.mutate(selectedCampaign.id); }}
                disabled={deleteCampaignMutation.isPending}
                className="text-red-400 hover:text-red-300 h-8 px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Industry", value: selectedCampaign.industry, color: "text-galactic-orange" },
              { label: "AI Mode", value: selectedCampaign.aiMode, color: "text-neon-purple" },
              { label: "Aggregated", value: selectedCampaign.postsAggregated, color: "text-blue-400" },
              { label: "Published", value: selectedCampaign.postsPublished, color: "text-green-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-space-dark rounded-xl p-3 text-center border border-white/5">
                <p className={`text-lg font-orbitron font-bold ${color}`}>{value}</p>
                <p className="text-gray-500 text-[11px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Content queue */}
        <div className="glass-effect rounded-xl p-5">
          <h3 className="text-sm font-orbitron font-bold text-galactic-orange flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" /> Content Queue
          </h3>
          <ContentQueuePanel campaignId={selectedCampaign.id} campaignName={selectedCampaign.name} />
        </div>
      </div>
    );
  }

  // ── Main campaigns list view ──

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Campaigns", value: stats?.totalCampaigns ?? 0, icon: Target, color: "text-galactic-orange" },
          { label: "Active", value: stats?.activeCampaigns ?? 0, icon: Play, color: "text-green-400" },
          { label: "Pending Review", value: stats?.pendingContent ?? 0, icon: Eye, color: "text-yellow-400" },
          { label: "Published", value: stats?.publishedContent ?? 0, icon: Share2, color: "text-blue-400" },
          { label: "Rejected", value: stats?.rejectedContent ?? 0, icon: XCircle, color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-effect rounded-xl p-4 text-center border border-white/5">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
            <p className={`text-xl font-orbitron font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-[11px] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Campaigns list */}
      <div className="glass-effect rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-galactic-orange/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-galactic-orange" />
            </div>
            <div>
              <h2 className="text-base font-orbitron font-bold text-galactic-orange">SPORTA Campaigns</h2>
              <p className="text-gray-500 text-xs">AI-powered social media automation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { refetchCampaigns(); refetchStats(); }}
              className="text-galactic-orange hover:text-galactic-gold h-8 w-8 p-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => setShowWizard(true)}
              className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold h-8 px-3"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
            </Button>
          </div>
        </div>

        {campaignsLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-galactic-orange" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-galactic-orange/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-galactic-orange/40" />
            </div>
            <p className="text-gray-400 font-orbitron font-semibold text-sm mb-1">No Campaigns Yet</p>
            <p className="text-gray-600 text-xs mb-4">Create your first SPORTA automation campaign to get started.</p>
            <Button
              size="sm"
              onClick={() => setShowWizard(true)}
              className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Create First Campaign
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 bg-space-dark rounded-xl border border-white/5 hover:border-galactic-orange/20 transition-all cursor-pointer group"
                onClick={() => setSelectedCampaignId(campaign.id)}
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-semibold text-sm truncate">{campaign.name}</span>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="text-galactic-orange">{campaign.industry}</span>
                    <span>·</span>
                    <span>{campaign.aiMode}</span>
                    <span>·</span>
                    <span>{campaign.approvalMode.replace("_", " ")}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-[11px] text-gray-600">
                    <span><span className="text-blue-400">{campaign.postsAggregated}</span> aggregated</span>
                    <span><span className="text-green-400">{campaign.postsPublished}</span> published</span>
                    <span><span className="text-red-400">{campaign.postsRejected}</span> rejected</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newStatus = campaign.status === "active" ? "paused" : "active";
                      toggleStatusMutation.mutate({ id: campaign.id, status: newStatus });
                    }}
                    disabled={toggleStatusMutation.isPending}
                    className={`h-7 w-7 p-0 ${
                      campaign.status === "active"
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-green-400 hover:text-green-300"
                    }`}
                    title={campaign.status === "active" ? "Pause" : "Activate"}
                  >
                    {campaign.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${campaign.name}"?`)) deleteCampaignMutation.mutate(campaign.id);
                    }}
                    disabled={deleteCampaignMutation.isPending}
                    className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-galactic-orange transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature overview teaser */}
      <div className="glass-effect rounded-xl p-5 border border-neon-cyan/10">
        <h3 className="text-sm font-orbitron font-bold text-neon-cyan flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" /> SPORTA Capabilities
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { icon: Globe2, label: "17+ Source Platforms", color: "text-neon-cyan" },
            { icon: Brain, label: "10 AI Reshape Modes", color: "text-neon-purple" },
            { icon: Share2, label: "10 Publishing Destinations", color: "text-galactic-orange" },
            { icon: Filter, label: "16 Advanced Filters", color: "text-neon-yellow" },
            { icon: Shield, label: "Full Approval Oversight", color: "text-galactic-green" },
            { icon: BarChart3, label: "Real-time Analytics", color: "text-galactic-gold" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
              <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
