import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Video, Play, Pause, Zap, RefreshCw, AlertCircle, CheckCircle2,
  Clock, Activity, Loader2, Settings, Rss, ExternalLink,
} from "lucide-react";

interface ChannelState {
  name: string;
  url: string;
  enabled: boolean;
  lastFetched: string | null;
  videosFound: number;
}

interface VidAggregatorStatus {
  running: boolean;
  paused: boolean;
  cycleRunning: boolean;
  lastRun: string | null;
  videosCreated: number;
  errors: number;
  pollIntervalMs: number;
  maxVideosPerChannel: number;
  channels: ChannelState[];
}

function fmtMs(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function fmtDate(iso: string | null): string {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });
}

function StateIndicator({ running, paused, cycleRunning }: Pick<VidAggregatorStatus, "running" | "paused" | "cycleRunning">) {
  if (!running) return (
    <span className="flex items-center gap-1.5 text-gray-400 text-sm font-medium">
      <span className="w-2.5 h-2.5 rounded-full bg-gray-500 inline-block" /> Stopped
    </span>
  );
  if (paused) return (
    <span className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block animate-pulse" /> Paused
    </span>
  );
  if (cycleRunning) return (
    <span className="flex items-center gap-1.5 text-blue-400 text-sm font-medium">
      <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> Fetching…
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
      <span className="w-2.5 h-2.5 rounded-full bg-green-400 inline-block animate-pulse" /> Running
    </span>
  );
}

export default function VidAggregatorTab() {
  const { toast } = useToast();

  const { data: status, refetch, isLoading } = useQuery<VidAggregatorStatus>({
    queryKey: ["/api/vid-aggregator/status"],
    queryFn: async () => {
      const res = await fetch("/api/vid-aggregator/status", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load vid-aggregator status");
      return res.json();
    },
    refetchInterval: 10_000,
  });

  const [pollMinutes, setPollMinutes] = useState<number>(30);
  const [maxVideos, setMaxVideos] = useState<number>(5);
  const [configDirty, setConfigDirty] = useState(false);

  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vid-aggregator/start"),
    onSuccess: () => { toast({ title: "Vid Aggregator started" }); refetch(); },
    onError: () => toast({ title: "Failed to start", variant: "destructive" }),
  });

  const pauseMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vid-aggregator/pause"),
    onSuccess: () => { toast({ title: "Vid Aggregator paused" }); refetch(); },
    onError: () => toast({ title: "Failed to pause", variant: "destructive" }),
  });

  const resumeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vid-aggregator/resume"),
    onSuccess: () => { toast({ title: "Vid Aggregator resumed" }); refetch(); },
    onError: () => toast({ title: "Failed to resume", variant: "destructive" }),
  });

  const triggerMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/vid-aggregator/trigger"),
    onSuccess: () => { toast({ title: "Video fetch triggered!" }); setTimeout(() => refetch(), 3_000); },
    onError: () => toast({ title: "Failed to trigger", variant: "destructive" }),
  });

  const configMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", "/api/vid-aggregator/config", {
        pollIntervalMs: Math.max(1, pollMinutes) * 60_000,
        maxVideosPerChannel: maxVideos,
      }),
    onSuccess: () => { toast({ title: "Configuration saved!" }); setConfigDirty(false); refetch(); },
    onError: () => toast({ title: "Failed to save config", variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <div className="glass-effect rounded-xl p-10 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-galactic-orange" />
      </div>
    );
  }

  if (!status) {
    return (
      <div className="glass-effect rounded-xl p-10 text-center text-muted-foreground">
        <AlertCircle className="w-10 h-10 text-galactic-orange/40 mx-auto mb-3" />
        <p>Could not load vid aggregator status.</p>
        <Button size="sm" variant="ghost" onClick={() => refetch()} className="mt-3 text-galactic-orange">
          <RefreshCw className="w-4 h-4 mr-1" /> Retry
        </Button>
      </div>
    );
  }

  const { running, paused, cycleRunning } = status;
  const anyMutating = startMutation.isPending || pauseMutation.isPending || resumeMutation.isPending || triggerMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Status Panel */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
              <Video className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-orbitron font-bold text-neon-cyan">Vid Aggregator</h2>
              <p className="text-muted-foreground text-xs mt-0.5">Scrapes tech YouTube channels &amp; auto-populates Vlog</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StateIndicator running={running} paused={paused} cycleRunning={cycleRunning} />
            <Button size="sm" variant="ghost" onClick={() => refetch()} className="text-neon-cyan hover:text-galactic-gold h-8 w-8 p-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Activity,    color: "text-green-400",  value: status.videosCreated,                                              label: "Videos Added" },
            { icon: AlertCircle, color: "text-red-400",    value: status.errors,                                                     label: "Errors"       },
            { icon: Clock,       color: "text-blue-400",   value: fmtMs(status.pollIntervalMs),                                      label: "Poll Interval"},
            { icon: Rss,         color: "text-neon-cyan",  value: `${status.channels.filter(c => c.enabled).length}/${status.channels.length}`, label: "Channels Active" },
          ].map(({ icon: Icon, color, value, label }) => (
            <div key={label} className="bg-muted rounded-xl p-4 text-center border border-border">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <p className={`text-xl font-orbitron font-bold ${color}`}>{value}</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground text-xs mb-5">
          Last run: <span className="text-foreground">{fmtDate(status.lastRun)}</span>
          <span className="ml-3">→</span>
          <a href="/vlog" target="_blank" rel="noopener noreferrer" className="ml-2 text-neon-cyan hover:underline inline-flex items-center gap-1">
            View Vlog <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex flex-wrap gap-2">
          {!running && (
            <Button size="sm" onClick={() => startMutation.mutate()} disabled={anyMutating}
              className="bg-green-500 hover:bg-green-400 text-space-black font-orbitron text-xs h-8">
              {startMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              Start
            </Button>
          )}
          {running && !paused && (
            <Button size="sm" onClick={() => pauseMutation.mutate()} disabled={anyMutating || cycleRunning}
              className="bg-yellow-500 hover:bg-yellow-400 text-space-black font-orbitron text-xs h-8">
              {pauseMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Pause className="w-3.5 h-3.5 mr-1" />}
              Pause
            </Button>
          )}
          {running && paused && (
            <Button size="sm" onClick={() => resumeMutation.mutate()} disabled={anyMutating}
              className="bg-green-500 hover:bg-green-400 text-space-black font-orbitron text-xs h-8">
              {resumeMutation.isPending ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
              Resume
            </Button>
          )}
          <Button size="sm" onClick={() => triggerMutation.mutate()}
            disabled={anyMutating || cycleRunning || paused || !running}
            variant="outline" className="border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 font-orbitron text-xs h-8">
            {triggerMutation.isPending || cycleRunning ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Zap className="w-3.5 h-3.5 mr-1" />}
            Fetch Now
          </Button>
        </div>
      </div>

      {/* Channel List */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-sm font-orbitron font-bold text-neon-cyan flex items-center gap-2 mb-4">
          <Rss className="w-4 h-4" /> Tech Video Channels
        </h3>
        <div className="space-y-3">
          {status.channels.map((ch) => (
            <div key={ch.name} className="flex items-center justify-between bg-muted rounded-xl px-4 py-3 border border-border">
              <div className="flex items-center gap-3 min-w-0">
                <Video className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-foreground text-sm font-medium truncate">{ch.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {ch.lastFetched ? `Last: ${fmtDate(ch.lastFetched)}` : "Not yet fetched"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {ch.videosFound > 0 && (
                  <Badge className="bg-neon-cyan/15 text-neon-cyan border-neon-cyan/20 text-[10px]">
                    {ch.videosFound} videos
                  </Badge>
                )}
                {ch.enabled
                  ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                  : <AlertCircle  className="w-4 h-4 text-muted-foreground" />
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration */}
      <div className="glass-effect rounded-xl p-6">
        <h3 className="text-sm font-orbitron font-bold text-neon-cyan flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4" /> Configuration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <Label className="text-neon-cyan/80 font-orbitron text-xs mb-1.5 block">Poll Interval (minutes)</Label>
            <Input
              type="number" min={1} max={1440} value={pollMinutes}
              onChange={(e) => { setPollMinutes(Number(e.target.value)); setConfigDirty(true); }}
              className="border-neon-cyan/30 text-foreground text-sm h-9"
            />
            <p className="text-muted-foreground text-[11px] mt-1">Current: {fmtMs(status.pollIntervalMs)}</p>
          </div>
          <div>
            <Label className="text-neon-cyan/80 font-orbitron text-xs mb-1.5 block">Max Videos per Channel</Label>
            <Input
              type="number" min={1} max={50} value={maxVideos}
              onChange={(e) => { setMaxVideos(Number(e.target.value)); setConfigDirty(true); }}
              className="border-neon-cyan/30 text-foreground text-sm h-9"
            />
            <p className="text-muted-foreground text-[11px] mt-1">Currently {status.maxVideosPerChannel} per channel.</p>
          </div>
        </div>
        <Button
          onClick={() => configMutation.mutate()}
          disabled={configMutation.isPending || !configDirty}
          className="bg-neon-cyan text-space-black font-orbitron text-xs hover:bg-neon-cyan/90 h-9"
        >
          {configMutation.isPending
            ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Saving…</>
            : <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Save Configuration</>
          }
        </Button>
        {configDirty && <span className="ml-3 text-yellow-400 text-xs font-medium">Unsaved changes</span>}
      </div>
    </div>
  );
}
