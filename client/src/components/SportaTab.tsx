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
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Film,
  FolderDown,
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
  if (value === undefined) return <span className="text-gray-500 text-xs"></span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-7 text-right">{value}</span>
    </div>
  );
}

// Detect YouTube video ID from a URL
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? null;
}

// Detect TikTok video URL (we can just open the link; embeds require SDK)
function isTikTokUrl(url: string): boolean {
  return /tiktok\.com\/@[^/]+\/video\//.test(url);
}

// Detect Vimeo video ID
function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m?.[1] ?? null;
}

// Media type → color class
function mediaTypeColor(mediaType: string): string {
  const map: Record<string, string> = {
    Videos: "bg-red-500/20 text-red-400 border-red-500/30",
    Shorts: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Reels: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Articles: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Tutorials: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Reviews: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Threads: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    Podcasts: "bg-green-500/20 text-green-400 border-green-500/30",
    Memes: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Images: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    Quotes: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  };
  return map[mediaType] ?? "bg-white/10 text-gray-300 border-white/10";
}

// Inline video preview component
function VideoPreview({ url, embedCode }: { url: string; embedCode?: string }) {
  const ytId = extractYouTubeId(url);
  const vimeoId = extractVimeoId(url);

  if (ytId) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/40 mt-3">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (vimeoId) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/40 mt-3">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  if (embedCode) {
    return (
      <div
        className="w-full mt-3 rounded-lg overflow-hidden"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    );
  }

  // TikTok or other video links — just show a link button
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-orbitron hover:bg-pink-500/20 transition-colors"
    >
      <Film className="w-3.5 h-3.5" /> Watch Video <ExternalLink className="w-3 h-3" />
    </a>
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

// ─── Wizard Component (5-step simplified) ────────────────────────────────────

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
        aiMode: data.aiMode || "Social Caption",
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

  // Step validation
  const canNext = () => {
    if (step === 1) return !!data.industry && data.contentTypes.length > 0;
    if (step === 2) return data.sourcePlatforms.length > 0;
    if (step === 3) return data.publishingDestinations.length > 0;
    return true;
  };

  const TOTAL_STEPS = 5;
  const stepLabels = ["Industry & Content", "Sources", "Publish & AI", "Schedule", "Launch"];

  return (
    <div className="glass-effect rounded-2xl p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-galactic-orange" />
          <h2 className="text-lg font-orbitron font-bold text-galactic-orange">New Campaign</h2>
        </div>
        <span className="text-xs text-gray-400 font-orbitron">Step {step}/{TOTAL_STEPS}</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-7">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex-1">
            <div className={`h-1 rounded-full transition-all ${i + 1 <= step ? "bg-galactic-orange" : "bg-white/10"}`} />
            <p className={`text-[9px] font-orbitron mt-1 truncate ${i + 1 === step ? "text-galactic-orange" : "text-gray-600"}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[240px]">

        {/* Step 1: Industry + Content Types */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-orbitron font-bold text-white mb-0.5 text-sm">Your Industry</h3>
              <p className="text-gray-500 text-xs mb-3">Pick the niche SPORTA should focus on.</p>
              <div className="flex flex-wrap gap-1.5">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => set("industry", ind)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-orbitron font-semibold border transition-all ${
                      data.industry === ind
                        ? "bg-galactic-orange text-space-black border-galactic-orange"
                        : "border-galactic-orange/20 text-gray-400 hover:border-galactic-orange/50 glass-effect"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-white mb-0.5 text-sm">Content Types</h3>
              <p className="text-gray-500 text-xs mb-3">What types of content should SPORTA find? (select all that apply)</p>
              <div className="flex flex-wrap gap-1.5">
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => toggle("contentTypes", ct)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-orbitron font-semibold border transition-all ${
                      data.contentTypes.includes(ct)
                        ? "bg-galactic-orange text-space-black border-galactic-orange"
                        : "border-galactic-orange/20 text-gray-400 hover:border-galactic-orange/50 glass-effect"
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Campaign name (optional)</Label>
              <Input
                value={data.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={`SPORTA – ${data.industry || "My Campaign"}`}
                className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
              />
            </div>
          </div>
        )}

        {/* Step 2: Source Platforms + Keywords */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-orbitron font-bold text-white mb-0.5 text-sm">Source Platforms</h3>
              <p className="text-gray-500 text-xs mb-3">Where should SPORTA pull content from?</p>
              <MultiSelectGrid
                label=""
                options={PLATFORMS}
                selected={data.sourcePlatforms}
                onToggle={(v) => toggle("sourcePlatforms", v)}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Target keywords (comma-separated)</Label>
                <Input
                  value={data.keywords}
                  onChange={(e) => set("keywords", e.target.value)}
                  placeholder="AI, startup, innovation…"
                  className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
                />
              </div>
              <div>
                <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Banned keywords (optional)</Label>
                <Input
                  value={data.bannedKeywords}
                  onChange={(e) => set("bannedKeywords", e.target.value)}
                  placeholder="spam, nsfw…"
                  className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Publishing Destinations + AI Mode + Approval */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-orbitron font-bold text-white mb-0.5 text-sm">Publishing Destinations</h3>
              <p className="text-gray-500 text-xs mb-3">Where should reshaped content be posted?</p>
              <MultiSelectGrid
                label=""
                options={PUBLISHING_DESTINATIONS}
                selected={data.publishingDestinations}
                onToggle={(v) => toggle("publishingDestinations", v)}
              />
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-white mb-0.5 text-sm">AI Transformation Mode</h3>
              <p className="text-gray-500 text-xs mb-3">How should SPORTA reshape the content?</p>
              <div className="flex flex-wrap gap-1.5">
                {AI_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set("aiMode", mode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-orbitron font-semibold border transition-all ${
                      data.aiMode === mode
                        ? "bg-neon-purple text-white border-neon-purple"
                        : "border-neon-purple/20 text-gray-400 hover:border-neon-purple/50 glass-effect"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-orbitron font-bold text-white mb-2 text-sm">Approval Mode</h3>
              <div className="space-y-2">
                {APPROVAL_MODES.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
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
                      <p className="text-white font-orbitron font-semibold text-xs">{label}</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">
                        {value === "manual" && "Every post needs your approval."}
                        {value === "semi_automatic" && "High-scoring posts auto-approved; others need review."}
                        {value === "fully_automatic" && "All posts publish automatically."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Schedule + Hashtags + Filters */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-orbitron font-bold text-white mb-0.5 text-sm">Posting Frequency</h3>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => set("postingFrequency", opt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-orbitron font-semibold border transition-all ${
                      data.postingFrequency === opt
                        ? "bg-galactic-green text-space-black border-galactic-green"
                        : "border-galactic-green/20 text-gray-400 hover:border-galactic-green/50 glass-effect"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Content freshness</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TIMELINE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set("timelinePreference", opt)}
                      className={`px-2 py-1 rounded-md text-[10px] font-orbitron border transition-all ${
                        data.timelinePreference === opt
                          ? "bg-neon-cyan text-space-black border-neon-cyan"
                          : "border-neon-cyan/20 text-gray-400 hover:border-neon-cyan/50 glass-effect"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-400 font-orbitron text-xs mb-1 block">Hashtags (optional)</Label>
                <Input
                  value={data.hashtags}
                  onChange={(e) => set("hashtags", e.target.value)}
                  placeholder="#tech, #ai…"
                  className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {[
                { key: "enableSeo" as const, label: "SEO Optimisation" },
                { key: "enableViral" as const, label: "Viral Optimisation" },
                { key: "enableNsfwFilter" as const, label: "NSFW Filter" },
                { key: "enableDuplicateFilter" as const, label: "Duplicate Filter" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-gray-400 font-orbitron text-xs">{label}</Label>
                  <Switch checked={data[key] as boolean} onCheckedChange={(v) => set(key, v)} className="data-[state=checked]:bg-galactic-orange" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Review + Launch */}
        {step === 5 && (
          <div>
            <h3 className="font-orbitron font-bold text-white mb-4 text-sm">Review & Launch</h3>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs mb-5">
              {[
                { label: "Name", value: data.name || `SPORTA – ${data.industry}` },
                { label: "Industry", value: data.industry },
                { label: "Content Types", value: data.contentTypes.join(", ") || "—" },
                { label: "Sources", value: data.sourcePlatforms.slice(0, 4).join(", ") + (data.sourcePlatforms.length > 4 ? `+${data.sourcePlatforms.length - 4}` : "") || "—" },
                { label: "Publish to", value: data.publishingDestinations.slice(0, 3).join(", ") + (data.publishingDestinations.length > 3 ? `+${data.publishingDestinations.length - 3}` : "") || "—" },
                { label: "AI Mode", value: data.aiMode || "Social Caption" },
                { label: "Frequency", value: data.postingFrequency },
                { label: "Approval", value: APPROVAL_MODES.find((m) => m.value === data.approvalMode)?.label ?? "" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-gray-500 font-orbitron text-[10px] w-24 flex-shrink-0">{label}:</span>
                  <span className="text-white text-[11px] flex-1">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-galactic-orange/5 border border-galactic-orange/20 mb-3">
              <CheckCircle className="w-5 h-5 text-galactic-orange flex-shrink-0" />
              <p className="text-gray-300 text-xs">Everything looks good! Click <strong className="text-galactic-orange">Launch</strong> to activate your campaign.</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20">
              <FolderDown className="w-4 h-4 text-neon-cyan flex-shrink-0" />
              <p className="text-gray-400 text-xs">
                After launching, open the campaign and click <strong className="text-neon-cyan">Build Batch Folders</strong> in the content queue to download all aggregated items as organised folders (ZIP).
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-7 pt-4 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => (step === 1 ? onCancel() : setStep((s) => s - 1))}
          className="text-gray-400 hover:text-white font-orbitron text-xs"
        >
          <ArrowLeft className="w-3 h-3 mr-1" /> {step === 1 ? "Cancel" : "Back"}
        </Button>
        {step < TOTAL_STEPS ? (
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
            className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold shadow-[0_0_20px_rgba(34,197,94,0.3)]"
          >
            {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
            Launch Campaign
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Share Popover ────────────────────────────────────────────────────────────

function SharePopover({ item, publishingDestinations = [] }: { item: SportaContent; publishingDestinations?: SportaPublishingDestination[] }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Clean helper — strip HTML tags so share text is plain
  const stripTags = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();

  const rawTitle = item.aiRewrittenTitle ?? item.originalTitle ?? "Check this out";
  const rawCaption = item.aiRewrittenContent ?? item.originalContent ?? "";
  const cleanTitle = stripTags(rawTitle);
  const cleanCaption = stripTags(rawCaption);

  const title = encodeURIComponent(cleanTitle);
  const hashtags = item.aiGeneratedHashtags.map((t) => t.replace(/^#/, "")).join(",");
  const tagStr = item.aiGeneratedHashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
  const sourceNote = `via ${item.sourcePlatform}`;
  const shareBody = `${cleanCaption ? cleanCaption.slice(0, 200) + "… " : ""}${sourceNote}${tagStr ? " " + tagStr : ""}`;
  const shareText = encodeURIComponent(shareBody);
  const url = encodeURIComponent(item.sourceUrl);
  const imageUrl = item.originalThumbnail ? encodeURIComponent(item.originalThumbnail) : "";

  // Full share text with title for platforms that need it
  const fullShareText = encodeURIComponent(`${cleanTitle}\n\n${shareBody}`);

  // All supported sharing destinations with their web share URLs
  const ALL_PLATFORMS: Array<{ key: string; name: string; color: string; href: string }> = [
    {
      key: "X",
      name: "X / Twitter",
      color: "text-sky-400",
      href: `https://twitter.com/intent/tweet?text=${fullShareText}&url=${url}${hashtags ? `&hashtags=${hashtags}` : ""}`,
    },
    {
      key: "Facebook",
      name: "Facebook",
      color: "text-blue-500",
      href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${fullShareText}`,
    },
    {
      key: "LinkedIn",
      name: "LinkedIn",
      color: "text-blue-400",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${shareText}${imageUrl ? `&source=${imageUrl}` : ""}`,
    },
    {
      key: "WhatsApp",
      name: "WhatsApp",
      color: "text-green-400",
      href: `https://wa.me/?text=${encodeURIComponent(`${cleanTitle}\n\n${shareBody}\n${item.sourceUrl}`)}`,
    },
    {
      key: "Telegram",
      name: "Telegram",
      color: "text-sky-300",
      href: `https://t.me/share/url?url=${url}&text=${encodeURIComponent(`${cleanTitle}\n\n${shareBody}`)}`,
    },
    {
      key: "Pinterest",
      name: "Pinterest",
      color: "text-red-400",
      href: `https://pinterest.com/pin/create/button/?url=${url}&description=${fullShareText}${imageUrl ? `&media=${imageUrl}` : ""}`,
    },
    {
      key: "TikTok",
      name: "TikTok",
      color: "text-pink-400",
      href: `https://www.tiktok.com/upload?description=${shareText}`,
    },
    {
      key: "Instagram",
      name: "Instagram (copy caption)",
      color: "text-rose-400",
      href: "#",
    },
    {
      key: "Threads",
      name: "Threads",
      color: "text-white",
      href: `https://www.threads.net/intent/post?text=${fullShareText}%20${url}`,
    },
  ];

  // If campaign has publishingDestinations, show those first (highlighted), then others
  const preferredKeys = new Set(
    publishingDestinations.map((d) => d.replace(" Community", "").replace("Website Blog", "").replace("Website Vlog", "")),
  );
  const preferred = ALL_PLATFORMS.filter((p) => preferredKeys.has(p.key));
  const rest = ALL_PLATFORMS.filter((p) => !preferredKeys.has(p.key));
  const platforms = preferred.length > 0 ? [...preferred, ...rest] : ALL_PLATFORMS;

  const copyCaption = () => {
    const text = [
      cleanTitle,
      "",
      cleanCaption,
      "",
      tagStr,
      "",
      `Source: ${item.sourcePlatform}, ${item.sourceUrl}`,
    ]
      .filter((l) => l !== undefined)
      .join("\n")
      .trim();
    navigator.clipboard.writeText(text).then(() => toast({ title: "Caption copied to clipboard!" }));
    setOpen(false);
  };

  const handlePlatformClick = (p: { key: string; href: string; name: string }) => {
    setOpen(false);
    if (p.key === "Instagram") {
      // Instagram doesn't support direct web share; copy caption for manual posting
      copyCaption();
      toast({ title: "Caption copied!", description: "Open Instagram and paste your caption." });
      return;
    }
    window.open(p.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative">
      <Button
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="bg-galactic-orange/20 text-galactic-orange border border-galactic-orange/30 hover:bg-galactic-orange/30 h-7 px-2 text-xs font-orbitron"
      >
        <Share2 className="w-3 h-3 mr-1" /> Share
      </Button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-56 bg-[#0c0c18] border border-white/10 rounded-xl shadow-xl p-2">
          {preferred.length > 0 && (
            <p className="text-[10px] text-galactic-orange px-2 mb-1.5 font-orbitron">Your target platforms</p>
          )}
          {preferred.length > 0 && preferred.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePlatformClick(p)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs ${p.color} transition-colors w-full text-left font-semibold`}
            >
              <Share2 className="w-3 h-3 opacity-70" />
              {p.name}
            </button>
          ))}
          {preferred.length > 0 && rest.length > 0 && (
            <div className="border-t border-white/5 my-1.5" />
          )}
          {(preferred.length > 0 ? rest : ALL_PLATFORMS).map((p) => (
            <button
              key={p.name}
              onClick={() => handlePlatformClick(p)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs ${p.color} transition-colors w-full text-left`}
            >
              <Share2 className="w-3 h-3 opacity-70" />
              {p.name}
            </button>
          ))}
          <div className="border-t border-white/5 mt-1.5 pt-1.5">
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-xs text-gray-300 w-full transition-colors"
              onClick={copyCaption}
            >
              <TrendingUp className="w-3 h-3 opacity-70" />
              Copy caption + hashtags
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Content Queue Panel ──────────────────────────────────────────────────────

function ContentQueuePanel({ campaignId, campaignName, publishingDestinations = [] }: { campaignId: string; campaignName: string; publishingDestinations?: SportaPublishingDestination[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, refetch } = useQuery<SportaContent[]>({
    queryKey: [`/api/sporta/campaigns/${campaignId}/content`],
    queryFn: async () => {
      const res = await fetch(`/api/sporta/campaigns/${campaignId}/content`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  const aggregateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/sporta/campaigns/${campaignId}/aggregate`, {});
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message ?? "Aggregation failed");
      }
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/sporta/campaigns/${campaignId}/content`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sporta/stats"] });
      toast({ title: `Aggregated ${data.aggregated} new items!`, description: `${data.skipped} duplicates/filtered skipped.` });
    },
    onError: (err: any) => toast({ title: "Aggregation failed", description: err.message, variant: "destructive" }),
  });

  const [batchDownloading, setBatchDownloading] = useState(false);
  const buildBatchFolders = async () => {
    if (!items.length) {
      toast({ title: "No content yet", description: "Run aggregation first to populate the queue.", variant: "destructive" });
      return;
    }
    setBatchDownloading(true);
    try {
      const res = await fetch(`/api/sporta/campaigns/${campaignId}/batch-folders`, { credentials: "include" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).message ?? "Failed to build batch folders");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${campaignName.replace(/\s+/g, "_")}_batch_folders.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Batch folders downloaded!", description: `${items.length} content folder${items.length === 1 ? "" : "s"} packaged into a ZIP.` });
    } catch (err: any) {
      toast({ title: "Download failed", description: err.message, variant: "destructive" });
    } finally {
      setBatchDownloading(false);
    }
  };

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/sporta/content/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sporta/campaigns/${campaignId}/content`] });
      queryClient.invalidateQueries({ queryKey: ["/api/sporta/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sporta/campaigns"] });
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

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isVideoType = (mt: string) => ["Videos", "Shorts", "Reels"].includes(mt);

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
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => refetch()} className="text-galactic-orange hover:text-galactic-gold h-7 w-7 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            onClick={buildBatchFolders}
            disabled={batchDownloading || items.length === 0}
            className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30 h-7 px-3 font-orbitron text-xs disabled:opacity-40"
            title="Download all content as organised folders (ZIP)"
          >
            {batchDownloading ? (
              <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Building…</>
            ) : (
              <><FolderDown className="w-3 h-3 mr-1" /> Build Batch Folders</>
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => aggregateMutation.mutate()}
            disabled={aggregateMutation.isPending}
            className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold h-7 px-3"
          >
            {aggregateMutation.isPending ? (
              <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Aggregating…</>
            ) : (
              <><Zap className="w-3 h-3 mr-1" /> Aggregate Now</>
            )}
          </Button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-galactic-orange/20" />
          <p className="text-sm">No content in queue yet.</p>
          <p className="text-xs text-gray-600 mt-1">Click <strong className="text-galactic-orange">Aggregate Now</strong> to pull up to 100 postable items.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const expanded = expandedIds.has(item.id);
            const isVideo = isVideoType(item.mediaType);
            const displayTitle = item.aiRewrittenTitle ?? item.originalTitle ?? "Untitled";
            const displayContent = item.aiRewrittenContent ?? item.originalContent;
            return (
              <div key={item.id} className="bg-space-dark rounded-xl border border-white/5 hover:border-galactic-orange/20 transition-all overflow-hidden">
                {/* Thumbnail strip — shown for non-video or collapsed video */}
                {item.originalThumbnail && !isVideo && (
                  <div className="w-full h-32 overflow-hidden bg-black/20 relative">
                    <img
                      src={item.originalThumbnail}
                      alt={item.originalTitle ?? "thumbnail"}
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        const placeholder = target.nextElementSibling as HTMLElement | null;
                        if (placeholder) placeholder.style.display = "flex";
                      }}
                    />
                    <div className="absolute inset-0 items-center justify-center bg-space-dark/80 text-gray-600 text-xs hidden">
                      <Eye className="w-5 h-5 opacity-30 mr-1" /> Image unavailable
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge className="bg-white/10 text-gray-300 border-white/10 text-[10px]">{item.sourcePlatform}</Badge>
                        <Badge className={`text-[10px] ${mediaTypeColor(item.mediaType)}`}>
                          {isVideo && <Film className="w-2.5 h-2.5 mr-0.5 inline" />}
                          {item.mediaType}
                        </Badge>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="text-white text-sm font-semibold line-clamp-2">{displayTitle}</p>
                      {displayContent && (
                        <p className={`text-gray-500 text-xs mt-1 ${expanded ? "" : "line-clamp-2"}`}>{displayContent}</p>
                      )}
                      {item.originalAuthor && (
                        <p className="text-gray-600 text-[10px] mt-1">From: {item.originalAuthor}</p>
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
                          {item.aiGeneratedHashtags.slice(0, expanded ? undefined : 5).map((tag) => (
                            <span key={tag} className="text-neon-cyan text-[10px]">#{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Expanded details */}
                      {expanded && (
                        <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
                          {/* Video embed */}
                          {isVideo && (
                            <VideoPreview url={item.sourceUrl} embedCode={item.embedCode} />
                          )}
                          {/* Source link */}
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-galactic-orange hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> View original source
                          </a>
                          {/* Full AI hashtags if many */}
                          {item.aiGeneratedHashtags.length > 5 && (
                            <p className="text-neon-cyan text-[11px]">
                              {item.aiGeneratedHashtags.map((t) => `#${t.replace(/^#/, "")}`).join(" ")}
                            </p>
                          )}
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
                      {/* Share button */}
                      <SharePopover item={item} publishingDestinations={publishingDestinations} />
                      {/* AI reshape — always available so user can re-run */}
                      <Button
                        size="sm"
                        onClick={() => reshapeMutation.mutate(item.id)}
                        disabled={reshapeMutation.isPending}
                        className="bg-neon-purple/20 text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/30 h-7 px-2 text-xs font-orbitron"
                      >
                        {reshapeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                        {reshapeMutation.isPending ? "" : "AI"}
                      </Button>
                      {/* Expand / collapse */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(item.id)}
                        className="text-gray-400 hover:text-white h-7 px-2"
                        title={expanded ? "Collapse" : "Expand details"}
                      >
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </Button>
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
              </div>
            );
          })}
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

  // Stats — poll every 10 s for real-time updates
  const { data: stats, refetch: refetchStats } = useQuery<SportaStats>({
    queryKey: ["/api/sporta/stats"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  // Campaigns — poll every 15 s so aggregated/published counts stay fresh
  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery<SportaCampaign[]>({
    queryKey: ["/api/sporta/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/campaigns", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 15_000,
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
          <ContentQueuePanel campaignId={selectedCampaign.id} campaignName={selectedCampaign.name} publishingDestinations={selectedCampaign.publishingDestinations} />
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
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-galactic-orange/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-galactic-orange" />
            </div>
            <div className="min-w-0">
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
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-semibold text-sm truncate max-w-[160px]">{campaign.name}</span>
                    <StatusBadge status={campaign.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                    <span className="text-galactic-orange">{campaign.industry}</span>
                    <span>·</span>
                    <span className="truncate max-w-[80px]">{campaign.aiMode}</span>
                    <span>·</span>
                    <span>{campaign.approvalMode.replace("_", " ")}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-[11px] text-gray-600">
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
            { icon: FolderDown, label: "Batch Content Folders (ZIP)", color: "text-neon-cyan" },
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
