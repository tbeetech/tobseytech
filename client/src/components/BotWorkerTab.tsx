import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Play,
  Pause,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Loader2,
  Settings,
  Rss,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FeedStatus {
  name: string;
  enabled: boolean;
  lastFetched: string | null;
  articlesFound: number;
}

interface BotStatus {
  running: boolean;
  paused: boolean;
  cycleRunning: boolean;
  lastRun: string | null;
  postsCreated: number;
  errors: number;
  pollIntervalMs: number;
  maxArticlesPerFeed: number;
  feeds: FeedStatus[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMs(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });
}

function StateIndicator({ running, paused, cycleRunning }: Pick<BotStatus, "running" | "paused" | "cycleRunning">) {
  if (!running) {
    return (
      <span className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" />
        Stopped
      </span>
    );
  }
  if (paused) {
    return (
      <span className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block animate-pulse" />
        Paused
      </span>
    );
  }
  if (cycleRunning) {
    return (
      <span className="flex items-center gap-1.5 text-blue-400 text-sm font-medium">
        <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
        Fetching…
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
      <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block animate-pulse" />
      Running
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BotWorkerTab() {
  const { toast } = useToast();

  // Auto-refresh status every 8 s when visible
  const { data: botStatus, refetch, isLoading } = useQuery<BotStatus>({
    queryKey: ["/api/bot/status"],
    queryFn: async () => {
      const res = await fetch("/api/bot/status", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load bot status");
      return res.json();
    },
    refetchInterval: 8000,
  });

  // Local config form state — kept in sync with server on load
  const [pollMinutes, setPollMinutes] = useState<number>(5);
  const [maxArticles, setMaxArticles] = useState<number>(5);
  const [feedToggles, setFeedToggles] = useState<Record<string, boolean>>({});
  const [configDirty, setConfigDirty] = useState(false);

  // Sync form when data arrives
  useEffect(() => {
    if (!botStatus) return;
    setPollMinutes(Math.round(botStatus.pollIntervalMs / 60_000) || 5);
    setMaxArticles(botStatus.maxArticlesPerFeed);
    const toggles: Record<string, boolean> = {};
    botStatus.feeds.forEach((f) => { toggles[f.name] = f.enabled; });
    setFeedToggles(toggles);
    setConfigDirty(false);
  }, [botStatus]);

  // ─── Mutations ───────────────────────────────────────────────────────────

  const pauseMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/pause"),
    onSuccess: () => { toast({ title: "Bot paused" }); refetch(); },
    onError: () => toast({ title: "Failed to pause bot", variant: "destructive" }),
  });

  const resumeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/resume"),
    onSuccess: () => { toast({ title: "Bot resumed" }); refetch(); },
    onError: () => toast({ title: "Failed to resume bot", variant: "destructive" }),
  });

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/start"),
    onSuccess: () => { toast({ title: "Bot started" }); refetch(); },
    onError: () => toast({ title: "Failed to start bot", variant: "destructive" }),
  });

  const triggerMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/bot/trigger"),
    onSuccess: () => { toast({ title: "Fetch cycle triggered!" }); setTimeout(() => refetch(), 2000); },
    onError: () => toast({ title: "Failed to trigger cycle", variant: "destructive" }),
  });

  const configMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", "/api/bot/config", {
        pollIntervalMs: Math.max(0.5, pollMinutes) * 60_000,
        maxArticlesPerFeed: maxArticles,
        feedEnabled: feedToggles,
      }),
    onSuccess: () => {
      toast({ title: "Configuration saved!" });
      setConfigDirty(false);
      refetch();
    },
    onError: () => toast({ title: "Failed to save config", variant: "destructive" }),
  });

  // ─── Feed toggle helper ───────────────────────────────────────────────────

  const toggleFeed = (name: string) => {
    setFeedToggles((prev) => ({ ...prev, [name]: !prev[name] }));
    setConfigDirty(true);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="glass-effect rounded-xl p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-galactic-orange" />
      </div>
    );
  }

  if (!botStatus) {
    return (
      <div className="glass-effect rounded-xl p-10 text-center text-gray-400">
        <AlertCircle className="w-10 h-10 text-galactic-orange/40 mx-auto mb-3" />
        <p>Could not load bot status. Make sure the bot worker is configured.</p>
        <Button size="sm" variant="ghost" onClick={() => refetch()} className="mt-3 text-galactic-orange">
          <RefreshCw className="w-4 h-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const { running, paused, cycleRunning } = botStatus;
  const anyMutating = pauseMutation.isPending || resumeMutation.isPending || startMutation.isPending || triggerMutation.isPending;

  return (
    <div className="space-y-6">

      {/* ── Status Panel ── */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-galactic-orange" />
            </div>
            <div>
              <h2 className="text-lg font-orbitron font-bold text-galactic-orange">Bot Worker</h2>
              <p className="text-gray-400 text-xs mt-0.5">RSS auto-poster status &amp; controls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StateIndicator running={running} paused={paused} cycleRunning={cycleRunning} />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              className="text-galactic-orange hover:text-galactic-gold h-8 w-8 p-0"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              icon: Activity,
              color: "text-green-400",
              value: botStatus.postsCreated,
              label: "Posts Created",
            },
            {
              icon: AlertCircle,
              color: "text-red-400",
              value: botStatus.errors,
              label: "Errors",
            },
            {
              icon: Clock,
              color: "text-blue-400",
              value: fmtMs(botStatus.pollIntervalMs),
              label: "Poll Interval",
            },
            {
              icon: Rss,
              color: "text-galactic-orange",
              value: botStatus.feeds.filter((f) => f.enabled).length + "/" + botStatus.feeds.length,
              label: "Feeds Active",
            },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="bg-space-dark rounded-xl p-4 text-center border border-white/5">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <p className={`text-xl font-orbitron font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-[11px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="text-gray-500 text-xs mb-5">
          Last run: <span className="text-gray-300">{fmtDate(botStatus.lastRun)}</span>
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Start (when stopped entirely) */}
          {!running && (
            <Button
              size="sm"
              onClick={() => startMutation.mutate()}
              disabled={anyMutating}
              className="bg-green-500 hover:bg-green-400 text-space-black font-orbitron text-xs h-8"
            >
              {startMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 mr-1" />
              )}
              Start Bot
            </Button>
          )}

          {/* Pause (when running and not paused) */}
          {running && !paused && (
            <Button
              size="sm"
              onClick={() => pauseMutation.mutate()}
              disabled={anyMutating || cycleRunning}
              className="bg-yellow-500 hover:bg-yellow-400 text-space-black font-orbitron text-xs h-8"
              title={cycleRunning ? "Cycle in progress — wait for it to finish" : undefined}
            >
              {pauseMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Pause className="w-3.5 h-3.5 mr-1" />
              )}
              Pause
            </Button>
          )}

          {/* Resume (when paused) */}
          {running && paused && (
            <Button
              size="sm"
              onClick={() => resumeMutation.mutate()}
              disabled={anyMutating}
              className="bg-green-500 hover:bg-green-400 text-space-black font-orbitron text-xs h-8"
            >
              {resumeMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 mr-1" />
              )}
              Resume
            </Button>
          )}

          {/* Trigger now — disabled when paused, cycling, or any mutation in flight */}
          <Button
            size="sm"
            onClick={() => triggerMutation.mutate()}
            disabled={anyMutating || cycleRunning || paused || !running}
            variant="outline"
            className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-xs h-8"
            title={
              paused ? "Resume the bot first" :
              !running ? "Start the bot first" :
              cycleRunning ? "Cycle already running" :
              "Run an immediate fetch cycle"
            }
          >
            {triggerMutation.isPending || cycleRunning ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 mr-1" />
            )}
            Fetch Now
          </Button>
        </div>
      </div>

      {/* ── Feed Status & Toggles ── */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-sm font-orbitron font-bold text-galactic-orange flex items-center gap-2 mb-4">
          <Rss className="w-4 h-4" /> RSS Feeds
        </h3>
        <div className="space-y-3">
          {botStatus.feeds.map((feed) => (
            <div
              key={feed.name}
              className="flex items-center justify-between bg-space-dark rounded-xl px-4 py-3 border border-white/5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Switch
                  checked={feedToggles[feed.name] ?? feed.enabled}
                  onCheckedChange={() => toggleFeed(feed.name)}
                  className="data-[state=checked]:bg-galactic-orange"
                  aria-label={`Toggle ${feed.name}`}
                />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{feed.name}</p>
                  <p className="text-gray-500 text-[11px]">
                    {feed.lastFetched ? (
                      <>Last: {fmtDate(feed.lastFetched)}</>
                    ) : (
                      "Not yet fetched"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {feed.articlesFound > 0 && (
                  <Badge className="bg-galactic-orange/15 text-galactic-orange border-galactic-orange/20 text-[10px]">
                    {feed.articlesFound} items
                  </Badge>
                )}
                {feedToggles[feed.name] ?? feed.enabled ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Configuration ── */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-sm font-orbitron font-bold text-galactic-orange flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4" /> Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <Label className="text-galactic-orange/80 font-orbitron text-xs mb-1.5 block">
              Poll Interval (minutes)
            </Label>
            <Input
              type="number"
              min={0.5}
              max={1440}
              step={0.5}
              value={pollMinutes}
              onChange={(e) => {
                setPollMinutes(Number(e.target.value));
                setConfigDirty(true);
              }}
              className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
            />
            <p className="text-gray-500 text-[11px] mt-1">
              Min 0.5 min (30 s). Current: {fmtMs(botStatus.pollIntervalMs)}
            </p>
          </div>

          <div>
            <Label className="text-galactic-orange/80 font-orbitron text-xs mb-1.5 block">
              Max Articles per Feed per Cycle
            </Label>
            <Input
              type="number"
              min={1}
              max={100}
              value={maxArticles}
              onChange={(e) => {
                setMaxArticles(Number(e.target.value));
                setConfigDirty(true);
              }}
              className="bg-space-dark border-galactic-orange/20 text-white text-sm h-9"
            />
            <p className="text-gray-500 text-[11px] mt-1">
              1–100. Currently {botStatus.maxArticlesPerFeed} per feed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => configMutation.mutate()}
            disabled={configMutation.isPending || !configDirty}
            className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold h-9"
          >
            {configMutation.isPending ? (
              <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving…</>
            ) : (
              <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Save Configuration</>
            )}
          </Button>
          {configDirty && (
            <span className="text-yellow-400 text-xs font-medium">Unsaved changes</span>
          )}
        </div>
      </div>
    </div>
  );
}
