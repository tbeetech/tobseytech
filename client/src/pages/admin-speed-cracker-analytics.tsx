import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Loader2, BarChart3, TrendingUp, CheckCircle, XCircle, Video, FileText, Zap, Clock } from "lucide-react";
import { format, subDays } from "date-fns";
import type { SportaCampaign } from "../../../shared/schema";

interface SCStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingContent: number;
  publishedContent: number;
  rejectedContent: number;
  totalVlogs: number;
  publishedVlogs: number;
}

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  targetType?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

const ACTION_ICON: Record<string, React.ElementType> = {
  "speed_cracker.content.approve": CheckCircle,
  "speed_cracker.content.reject": XCircle,
  "speed_cracker.vlog.publish": Video,
  "speed_cracker.blog.publish": FileText,
  "speed_cracker.campaign.launch": Zap,
};

export default function AdminSpeedCrackerAnalyticsPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<SCStats>({
    queryKey: ["/api/speed-cracker/stats"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/speed-cracker/audit-logs?limit=200"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/audit-logs?limit=200", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const { data: campaigns = [] } = useQuery<SportaCampaign[]>({
    queryKey: ["/api/sporta/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/campaigns", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") return null;

  // Compute action frequency from logs
  const actionCounts: Record<string, number> = {};
  logs.forEach((log) => {
    actionCounts[log.action] = (actionCounts[log.action] ?? 0) + 1;
  });

  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const publishRate = stats
    ? stats.publishedContent + stats.rejectedContent > 0
      ? Math.round((stats.publishedContent / (stats.publishedContent + stats.rejectedContent)) * 100)
      : 0
    : 0;

  return (
    <SpeedCrackerLayout title="Analytics" subtitle="System-wide performance and activity overview">
      {statsLoading ? (
        <div className="flex items-center gap-2 text-gray-400 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading…</span>
        </div>
      ) : stats ? (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Campaigns", value: stats.totalCampaigns, icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
              { label: "Active Campaigns", value: stats.activeCampaigns, icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
              { label: "Published Content", value: stats.publishedContent, icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Publish Success Rate", value: `${publishRate}%`, icon: BarChart3, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`p-4 rounded-xl border ${bg}`}>
                <Icon className={`w-5 h-5 ${color} mb-2`} />
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Content pipeline breakdown */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              Content Pipeline
            </h3>
            <div className="space-y-3">
              {[
                { label: "Pending Approval", value: stats.pendingContent, color: "bg-yellow-500", max: stats.pendingContent + stats.publishedContent + stats.rejectedContent },
                { label: "Published", value: stats.publishedContent, color: "bg-green-500", max: stats.pendingContent + stats.publishedContent + stats.rejectedContent },
                { label: "Rejected", value: stats.rejectedContent, color: "bg-red-500", max: stats.pendingContent + stats.publishedContent + stats.rejectedContent },
                { label: "Vlog Posts (published)", value: stats.publishedVlogs, color: "bg-purple-500", max: stats.totalVlogs || 1 },
              ].map(({ label, value, color, max }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: max ? `${Math.round((value / max) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Campaign performance table */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400" />
          Campaign Performance
        </h3>
        {campaigns.length === 0 ? (
          <p className="text-sm text-gray-500">No campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left">
                  <th className="pb-2 pr-4">Campaign</th>
                  <th className="pb-2 pr-4">Industry</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2 pr-4">Aggregated</th>
                  <th className="pb-2 pr-4">Published</th>
                  <th className="pb-2">Rejected</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-2 pr-4 text-white font-medium truncate max-w-[160px]">{c.name}</td>
                    <td className="py-2 pr-4 text-gray-400">{c.industry}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        c.status === "active" ? "bg-green-500/20 text-green-400"
                          : c.status === "paused" ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-700 text-gray-400"
                      }`}>{c.status}</span>
                    </td>
                    <td className="py-2 pr-4 text-gray-400">{c.postsAggregated}</td>
                    <td className="py-2 pr-4 text-green-400">{c.postsPublished}</td>
                    <td className="py-2 text-red-400">{c.postsRejected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action frequency */}
      {topActions.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            Top Admin Actions
          </h3>
          <div className="space-y-2">
            {topActions.map(([action, count]) => {
              const Icon = ACTION_ICON[action] ?? Clock;
              return (
                <div key={action} className="flex items-center gap-3">
                  <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-400 flex-1">{action.replace(/speed_cracker\.|admin\./, "").replace(/\./g, " › ")}</span>
                  <span className="text-xs font-bold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent audit log */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Full Audit Log (last 200 entries)
        </h3>
        {logsLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500">No logs yet.</p>
        ) : (
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-1.5 border-b border-gray-800/50 last:border-0 text-xs">
                <span className="text-gray-500 whitespace-nowrap w-28 flex-shrink-0">
                  {format(new Date(log.createdAt), "MM/dd HH:mm")}
                </span>
                <span className="text-purple-400 font-medium w-20 flex-shrink-0 truncate">{log.adminName}</span>
                <span className="text-gray-400 flex-1 truncate">{log.action}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SpeedCrackerLayout>
  );
}
