import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import DevTipsLayout from "@/components/DevTipsLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Send,
  Trash2,
  Eye,
  Clock,
  TrendingUp,
  Zap,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BotStatus {
  running: boolean;
  paused: boolean;
  cycleRunning: boolean;
  lastRun: string | null;
  nextRun: string | null;
  totalGenerated: number;
  totalPublished: number;
  postIntervalMs: number;
  autoPublish: boolean;
  currentPillarIndex: number;
}

interface DevTipsPost {
  _id: string;
  pillar: string;
  format: string;
  title: string;
  caption: string;
  hashtags: string[];
  status: "pending" | "approved" | "rejected" | "published" | "failed";
  platforms: string[];
  publishedPlatforms: string[];
  scheduledAt?: string;
  publishedAt?: string;
  errorLog?: string;
  createdAt: string;
}

interface PostsResponse {
  posts: DevTipsPost[];
  total: number;
  page: number;
  limit: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PILLAR_COLORS: Record<string, string> = {  "code-snippet":   "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "architecture":   "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "devops":         "bg-green-500/20 text-green-400 border-green-500/30",
  "performance":    "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "security":       "bg-red-500/20 text-red-400 border-red-500/30",
  "tool-discovery": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "career-mindset": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "frontend":       "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "api-design":     "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const PILLAR_LABELS: Record<string, string> = {
  "code-snippet":   "Code Snippet",
  "architecture":   "Architecture",
  "devops":         "DevOps",
  "performance":    "Performance",
  "security":       "Security",
  "tool-discovery": "Tool Discovery",
  "career-mindset": "Career",
  "frontend":       "Frontend",
  "api-design":     "API Design",
};

const STATUS_BADGE: Record<string, string> = {
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  approved:  "bg-blue-500/20 text-blue-400 border-blue-500/30",
  rejected:  "bg-red-500/20 text-red-400 border-red-500/30",
  published: "bg-green-500/20 text-green-400 border-green-500/30",
  failed:    "bg-red-700/20 text-red-300 border-red-700/30",
};

function msToHuman(ms: number): string {
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / 60000)} min`;
  if (hours < 24) return `${hours.toFixed(1)} hr`;
  return `${(hours / 24).toFixed(1)} days`;
}

function formatErrorLog(log: string): string {
  try {
    return JSON.stringify(JSON.parse(log));
  } catch {
    return log;
  }
}

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDevTipsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery<BotStatus>({
    queryKey: ["/api/admin/dev-tips/status"],
    queryFn: () => apiCall("/api/admin/dev-tips/status"),
    enabled: user?.role === "admin",
    refetchInterval: 15_000,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery<PostsResponse>({
    queryKey: ["/api/admin/dev-tips/posts", page, statusFilter],
    queryFn: () =>
      apiCall(`/api/admin/dev-tips/posts?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ""}`),
    enabled: user?.role === "admin",
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["/api/admin/dev-tips/status"] });
    qc.invalidateQueries({ queryKey: ["/api/admin/dev-tips/posts"] });
  };

  const botMutation = useMutation({
    mutationFn: (action: string) => apiCall(`/api/admin/dev-tips/${action}`, "POST"),
    onSuccess: (_, action) => {
      toast({ title: `Bot ${action}ed`, description: `Dev Tips Bot has been ${action}ed.` });
      invalidate();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const generateMutation = useMutation({
    mutationFn: () => apiCall("/api/admin/dev-tips/generate", "POST"),
    onSuccess: (data) => {
      if (data.generated) {
        toast({ title: "Tip generated", description: "New dev tip created successfully." });
      } else {
        toast({ title: "Generation skipped", description: data.error ?? "Already running or no key.", variant: "destructive" });
      }
      invalidate();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const postMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      apiCall(`/api/admin/dev-tips/posts/${id}/${action}`, "POST"),
    onSuccess: (_, { action }) => {
      toast({ title: `Post ${action}d` });
      invalidate();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiCall(`/api/admin/dev-tips/posts/${id}`, "DELETE"),
    onSuccess: () => {
      toast({ title: "Post deleted" });
      invalidate();
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  if (user?.role !== "admin") return null;

  const totalPages = postsData ? Math.ceil(postsData.total / postsData.limit) : 1;

  const statCards = [
    {
      label: "Total Generated",
      value: status?.totalGenerated ?? 0,
      icon: Lightbulb,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Total Published",
      value: status?.totalPublished ?? 0,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Pending Review",
      value: postsData?.posts.filter((p) => p.status === "pending").length ?? 0,
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Post Interval",
      value: status ? msToHuman(status.postIntervalMs) : "—",
      icon: Zap,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <DevTipsLayout
      title="Daily Dev Tips Bot"
      subtitle="AI-powered dev content for X, LinkedIn, Instagram & Threads"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-gray-400">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bot controls */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">Bot Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  statusLoading
                    ? "bg-gray-700 text-gray-400"
                    : status?.running && !status.paused
                    ? "bg-green-500/20 text-green-400"
                    : status?.paused
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {statusLoading ? "…" : status?.running && !status.paused ? "Running" : status?.paused ? "Paused" : "Stopped"}
              </span>
              {status?.cycleRunning && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400">
                  Generating…
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 space-x-4">
              {status?.lastRun && (
                <span>Last run: {format(new Date(status.lastRun), "MMM d, HH:mm")}</span>
              )}
              {status?.nextRun && (
                <span>Next run: {format(new Date(status.nextRun), "MMM d, HH:mm")}</span>
              )}
              {status?.autoPublish && (
                <span className="text-green-400">Auto-publish ON</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!status?.running && (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => botMutation.mutate("start")}
                disabled={botMutation.isPending}
              >
                <Play className="w-3 h-3 mr-1" /> Start
              </Button>
            )}
            {status?.running && !status.paused && (
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => botMutation.mutate("pause")}
                disabled={botMutation.isPending}
              >
                <Pause className="w-3 h-3 mr-1" /> Pause
              </Button>
            )}
            {status?.running && status.paused && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => botMutation.mutate("resume")}
                disabled={botMutation.isPending}
              >
                <Play className="w-3 h-3 mr-1" /> Resume
              </Button>
            )}
            {status?.running && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => botMutation.mutate("stop")}
                disabled={botMutation.isPending}
              >
                <Square className="w-3 h-3 mr-1" /> Stop
              </Button>
            )}
            <Button
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || status?.cycleRunning}
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${generateMutation.isPending ? "animate-spin" : ""}`} />
              Generate Now
            </Button>
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800 flex-wrap">
          <h2 className="text-sm font-semibold text-white flex-1">Generated Posts</h2>
          {["", "pending", "approved", "published", "rejected", "failed"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>

        {postsLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm">Loading…</div>
        ) : !postsData?.posts.length ? (
          <div className="p-8 text-center">
            <Lightbulb className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No posts yet. Click "Generate Now" to create your first dev tip.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {postsData.posts.map((post) => (
              <div key={post._id} className="p-4 hover:bg-gray-800/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          PILLAR_COLORS[post.pillar] ?? "bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                      >
                        {PILLAR_LABELS[post.pillar] ?? post.pillar}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          STATUS_BADGE[post.status] ?? "bg-gray-700 text-gray-300 border-gray-600"
                        }`}
                      >
                        {post.status}
                      </span>
                      <span className="text-[10px] text-gray-500 uppercase bg-gray-800 px-2 py-0.5 rounded">
                        {post.format}
                      </span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-white mb-1 truncate">{post.title}</p>

                    {/* Caption preview */}
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{post.caption}</p>

                    {/* Platforms + date */}
                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500">
                      {post.platforms.map((p) => (
                        <span key={p} className="bg-gray-800 px-1.5 py-0.5 rounded capitalize">{p}</span>
                      ))}
                      {post.publishedPlatforms.length > 0 && (
                        <span className="text-green-500">
                          Published to: {post.publishedPlatforms.join(", ")}
                        </span>
                      )}
                      <span className="ml-auto">{format(new Date(post.createdAt), "MMM d, HH:mm")}</span>
                    </div>

                    {/* Error */}
                    {post.errorLog && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-red-400">
                        <AlertCircle className="w-3 h-3" />
                        <span className="truncate">{formatErrorLog(post.errorLog)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-gray-500 hover:text-cyan-400"
                      title="Preview SVG card"
                      onClick={() => setPreviewPostId(previewPostId === post._id ? null : post._id)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>

                    {(post.status === "pending" || post.status === "rejected") && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-gray-500 hover:text-green-400"
                        title="Approve"
                        onClick={() => postMutation.mutate({ id: post._id, action: "approve" })}
                        disabled={postMutation.isPending}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {post.status === "pending" && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-gray-500 hover:text-red-400"
                        title="Reject"
                        onClick={() => postMutation.mutate({ id: post._id, action: "reject" })}
                        disabled={postMutation.isPending}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    {(post.status === "approved" || post.status === "failed") && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-gray-500 hover:text-blue-400"
                        title="Publish now"
                        onClick={() => postMutation.mutate({ id: post._id, action: "publish" })}
                        disabled={postMutation.isPending}
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    )}

                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-gray-500 hover:text-red-400"
                      title="Delete"
                      onClick={() => deleteMutation.mutate(post._id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* SVG Preview inline */}
                {previewPostId === post._id && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-700 bg-gray-950">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
                      <span className="text-xs text-gray-400">Card Preview</span>
                      <div className="flex gap-2">
                        <a
                          href={`/api/admin/dev-tips/posts/${post._id}/preview.svg`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          Open SVG
                        </a>
                        <a
                          href={`/api/admin/dev-tips/posts/${post._id}/preview.html`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-purple-400 hover:underline"
                        >
                          Open HTML
                        </a>
                      </div>
                    </div>
                    <img
                      src={`/api/admin/dev-tips/posts/${post._id}/preview.svg`}
                      alt="Card preview"
                      className="w-full max-h-64 object-contain"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              {postsData?.total ?? 0} posts · Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-400 h-7 px-2"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-gray-700 text-gray-400 h-7 px-2"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </DevTipsLayout>
  );
}
