import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DevTipsLayout from "@/components/DevTipsLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Settings,
  Zap,
  Globe,
  BarChart3,
  KeyRound,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SocialAccount {
  platform: string;
  enabled: boolean;
  hasToken: boolean;
  accountId?: string;
  displayName?: string;
  connectedAt?: string;
}

interface BotConfig {
  running: boolean;
  paused: boolean;
  postIntervalMs: number;
  allowedFormats: string[];
  defaultPlatforms: string[];
  pillarWeights: Record<string, number>;
  socialAccounts: SocialAccount[];
  autoPublish: boolean;
  tone: string;
  audience: string;
  lastPillarIndex: number;
  totalGenerated: number;
  totalPublished: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PILLARS = [
  { key: "code-snippet",   label: "Code Snippet of the Day",  emoji: "⚡" },
  { key: "architecture",   label: "Architecture Insight",      emoji: "🏗️" },
  { key: "devops",         label: "DevOps & CI/CD",            emoji: "🔧" },
  { key: "performance",    label: "Performance Hack",          emoji: "🚀" },
  { key: "security",       label: "Security Spotlight",        emoji: "🔒" },
  { key: "tool-discovery", label: "Tool Discovery",            emoji: "🛠️" },
  { key: "career-mindset", label: "Career & Mindset",          emoji: "🧠" },
  { key: "frontend",       label: "Frontend & CSS Mastery",    emoji: "🎨" },
  { key: "api-design",     label: "API Design",                emoji: "🔌" },
];

const FORMATS = [
  { key: "plain-text",  label: "Plain Text" },
  { key: "code-card",   label: "Code Card (SVG)" },
  { key: "infographic", label: "Infographic (SVG)" },
  { key: "thread",      label: "Thread (multi-part)" },
];

const PLATFORMS = [
  { key: "twitter",   label: "X (Twitter)",  color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { key: "linkedin",  label: "LinkedIn",     color: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
  { key: "instagram", label: "Instagram",    color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { key: "threads",   label: "Threads",      color: "bg-gray-500/20 text-gray-300 border-gray-500/30" },
];

const INTERVAL_PRESETS = [
  { label: "1 hour",  ms: 60 * 60 * 1000 },
  { label: "3 hours", ms: 3 * 60 * 60 * 1000 },
  { label: "6 hours", ms: 6 * 60 * 60 * 1000 },
  { label: "12 hours", ms: 12 * 60 * 60 * 1000 },
  { label: "Daily",   ms: 24 * 60 * 60 * 1000 },
  { label: "2 days",  ms: 2 * 24 * 60 * 60 * 1000 },
];

async function apiCall(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json();
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
        <Icon className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Social Account Row ───────────────────────────────────────────────────────

function SocialAccountRow({
  platform,
  label,
  colorCls,
  account,
  onSave,
  saving,
}: {
  platform: string;
  label: string;
  colorCls: string;
  account?: SocialAccount;
  onSave: (data: {
    platform: string;
    enabled: boolean;
    accessToken?: string;
    accountId?: string;
    displayName?: string;
  }) => void;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState("");
  const [accountId, setAccountId] = useState(account?.accountId ?? "");
  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [enabled, setEnabled] = useState(account?.enabled ?? false);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden mb-3">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800/40"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colorCls}`}>{label}</span>
          {account?.hasToken ? (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="w-3 h-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3" /> Not connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              setEnabled(v);
              // Immediately toggle without requiring save
              onSave({ platform, enabled: v, accountId, displayName });
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs text-gray-500">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-800 bg-gray-950/40">
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Access Token</Label>
            <div className="flex gap-2">
              <Input
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={account?.hasToken ? "Token saved, paste new token to update" : "Paste API token or OAuth access token"}
                className="bg-gray-900 border-gray-700 text-white text-xs h-8"
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-gray-500"
                onClick={() => setShowToken((s) => !s)}
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </Button>
            </div>
            {platform === "twitter" && (
              <p className="text-[10px] text-gray-500">
                X API v2 Bearer Token or OAuth 2.0 User Access Token (with write:tweets scope)
              </p>
            )}
            {platform === "linkedin" && (
              <p className="text-[10px] text-gray-500">
                LinkedIn OAuth 2.0 access token with w_member_social scope
              </p>
            )}
            {platform === "instagram" && (
              <p className="text-[10px] text-gray-500">
                Instagram Graph API access token (requires Business/Creator account)
              </p>
            )}
            {platform === "threads" && (
              <p className="text-[10px] text-gray-500">
                Meta Threads API access token (from Meta developer portal)
              </p>
            )}
          </div>

          {platform !== "twitter" && (
            <div className="space-y-1">
              <Label className="text-xs text-gray-400">
                {platform === "linkedin" ? "Person URN (e.g. ABC123)" : "Account / User ID"}
              </Label>
              <Input
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder={
                  platform === "linkedin" ? "LinkedIn Person ID (from profile URL)"
                  : platform === "instagram" ? "Instagram Business Account ID"
                  : "Threads User ID"
                }
                className="bg-gray-900 border-gray-700 text-white text-xs h-8"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Display Name (optional)</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={`Your @handle or page name on ${label}`}
              className="bg-gray-900 border-gray-700 text-white text-xs h-8"
            />
          </div>

          <Button
            size="sm"
            className="bg-cyan-600 hover:bg-cyan-700 text-white h-7 text-xs"
            onClick={() =>
              onSave({
                platform,
                enabled,
                accessToken: token || undefined,
                accountId: accountId || undefined,
                displayName: displayName || undefined,
              })
            }
            disabled={saving}
          >
            <Save className="w-3 h-3 mr-1" />
            {saving ? "Saving…" : "Save Account"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDevTipsSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: config, isLoading } = useQuery<BotConfig>({
    queryKey: ["/api/admin/dev-tips/config"],
    queryFn: () => apiCall("/api/admin/dev-tips/config"),
    enabled: user?.role === "admin",
  });

  const [postInterval, setPostInterval] = useState(24 * 60 * 60 * 1000);
  const [allowedFormats, setAllowedFormats] = useState<string[]>(["plain-text", "code-card", "infographic"]);
  const [defaultPlatforms, setDefaultPlatforms] = useState<string[]>(["twitter", "linkedin"]);
  const [pillarWeights, setPillarWeights] = useState<Record<string, number>>({});
  const [autoPublish, setAutoPublish] = useState(false);
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("mid-senior engineers");

  // Sync config into local state when loaded
  useEffect(() => {
    if (!config) return;
    setPostInterval(config.postIntervalMs);
    if (config.allowedFormats?.length) setAllowedFormats(config.allowedFormats);
    if (config.defaultPlatforms?.length) setDefaultPlatforms(config.defaultPlatforms);
    setAutoPublish(config.autoPublish);
    if (config.tone) setTone(config.tone);
    if (config.audience) setAudience(config.audience);
    if (config.pillarWeights) {
      const w = Object.fromEntries(
        PILLARS.map((p) => [p.key, (config.pillarWeights as Record<string, number>)[p.key] ?? 1])
      );
      setPillarWeights(w);
    } else {
      setPillarWeights(Object.fromEntries(PILLARS.map((p) => [p.key, 1])));
    }
  }, [config]);

  const configMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiCall("/api/admin/dev-tips/config", "PATCH", body),
    onSuccess: () => {
      toast({ title: "Settings saved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/dev-tips/config"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const socialMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiCall("/api/admin/dev-tips/social-accounts", "PATCH", body),
    onSuccess: () => {
      toast({ title: "Account saved" });
      qc.invalidateQueries({ queryKey: ["/api/admin/dev-tips/config"] });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleFormat = (f: string) => {
    setAllowedFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const togglePlatform = (p: string) => {
    setDefaultPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSave = () => {
    configMutation.mutate({
      postIntervalMs: postInterval,
      allowedFormats,
      defaultPlatforms,
      pillarWeights,
      autoPublish,
      tone,
      audience,
    });
  };

  if (user?.role !== "admin") return null;

  return (
    <DevTipsLayout title="Bot Settings" subtitle="Configure the Daily Dev Tips Bot">
      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Loading configuration…</div>
      ) : (
        <>
          {/* Posting Interval */}
          <SettingsSection title="Posting Schedule" icon={Zap}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {INTERVAL_PRESETS.map(({ label, ms }) => (
                  <button
                    key={ms}
                    onClick={() => setPostInterval(ms)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      postInterval === ms
                        ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                        : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={Math.round(postInterval / 60000)}
                  onChange={(e) => setPostInterval(Number(e.target.value) * 60000)}
                  className="bg-gray-900 border-gray-700 text-white w-32 h-8 text-sm"
                  min="1"
                />
                <span className="text-sm text-gray-400">minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white text-sm">Auto-Publish</Label>
                  <p className="text-xs text-gray-400">Skip approval and publish generated tips immediately</p>
                </div>
                <Switch
                  checked={autoPublish}
                  onCheckedChange={setAutoPublish}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Content Formats */}
          <SettingsSection title="Content Formats" icon={Settings}>
            <p className="text-xs text-gray-400 mb-3">
              The bot will randomly pick from the enabled formats when generating each tip.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleFormat(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                    allowedFormats.includes(key)
                      ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                      : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${allowedFormats.includes(key) ? "bg-cyan-400" : "bg-gray-600"}`} />
                  {label}
                </button>
              ))}
            </div>
          </SettingsSection>

          {/* Default Platforms */}
          <SettingsSection title="Default Platforms" icon={Globe}>
            <p className="text-xs text-gray-400 mb-3">
              New posts will be targeted to these platforms by default.
            </p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => togglePlatform(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    defaultPlatforms.includes(key)
                      ? color
                      : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </SettingsSection>

          {/* AI Settings */}
          <SettingsSection title="AI Generation" icon={RefreshCw}>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm text-white">Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {["professional", "conversational", "technical", "enthusiastic", "concise"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-3 py-1 rounded-full text-xs border capitalize transition-all ${
                        tone === t
                          ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                          : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-sm text-white">Target Audience</Label>
                <div className="flex flex-wrap gap-2">
                  {["junior developers", "mid-senior engineers", "tech leads", "all developers", "DevOps engineers"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAudience(a)}
                      className={`px-3 py-1 rounded-full text-xs border capitalize transition-all ${
                        audience === a
                          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                          : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>

          {/* Content Pillar Weights */}
          <SettingsSection title="Content Pillar Rotation" icon={BarChart3}>
            <p className="text-xs text-gray-400 mb-3">
              Set the relative frequency weight for each pillar (higher = picked more often). Set to 0 to disable a pillar.
            </p>
            <div className="space-y-3">
              {PILLARS.map(({ key, label, emoji }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-lg w-6">{emoji}</span>
                  <span className="flex-1 text-sm text-gray-300">{label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={pillarWeights[key] ?? 1}
                      onChange={(e) =>
                        setPillarWeights((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                      }
                      className="w-24 accent-cyan-400"
                    />
                    <span className="text-xs text-cyan-400 w-4 text-center">
                      {pillarWeights[key] ?? 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SettingsSection>

          {/* Social Accounts */}
          <SettingsSection title="Social Media Accounts" icon={KeyRound}>
            <p className="text-xs text-gray-400 mb-4">
              Connect your social media accounts. Tokens are stored securely on the server and
              never exposed in the UI. Each platform requires its own API credentials.
            </p>
            {PLATFORMS.map(({ key, label, color }) => {
              const account = config?.socialAccounts?.find((a) => a.platform === key);
              return (
                <SocialAccountRow
                  key={key}
                  platform={key}
                  label={label}
                  colorCls={color}
                  account={account}
                  onSave={(data) => socialMutation.mutate(data as Record<string, unknown>)}
                  saving={socialMutation.isPending}
                />
              );
            })}
          </SettingsSection>

          {/* Save button */}
          <div className="flex justify-end pt-2">
            <Button
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={handleSave}
              disabled={configMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {configMutation.isPending ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </>
      )}
    </DevTipsLayout>
  );
}
