import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Loader2, Zap, GitBranch, CheckSquare, Video, FileText, BarChart3, TrendingUp, Clock } from "lucide-react";
import { format } from "date-fns";

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
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  "speed_cracker.campaign.create": "Created campaign",
  "speed_cracker.campaign.launch": "Launched campaign",
  "speed_cracker.campaign.pause": "Paused campaign",
  "speed_cracker.content.approve": "Approved content",
  "speed_cracker.content.reject": "Rejected content",
  "speed_cracker.content.publish": "Published content",
  "speed_cracker.content.bulk_approve": "Bulk approved content",
  "speed_cracker.content.bulk_reject": "Bulk rejected content",
  "speed_cracker.vlog.create": "Created vlog post",
  "speed_cracker.vlog.publish": "Published vlog",
  "speed_cracker.blog.publish": "Published blog post",
  "speed_cracker.settings.update": "Updated settings",
};

export default function AdminSpeedCrackerPage() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<SCStats>({
    queryKey: ["/api/speed-cracker/stats"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load stats");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/speed-cracker/audit-logs"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/audit-logs?limit=20", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load logs");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  if (user?.role !== "admin") return null;

  const statCards = [
    { label: "Active Campaigns", value: stats?.activeCampaigns ?? 0, icon: GitBranch, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { label: "Pending Approval", value: stats?.pendingContent ?? 0, icon: CheckSquare, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { label: "Published Content", value: stats?.publishedContent ?? 0, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { label: "Total Campaigns", value: stats?.totalCampaigns ?? 0, icon: Zap, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
    { label: "Vlog Posts", value: stats?.totalVlogs ?? 0, icon: Video, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { label: "Published Vlogs", value: stats?.publishedVlogs ?? 0, icon: FileText, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  ];

  return (
    <SpeedCrackerLayout
      title="Speed Cracker Dashboard"
      subtitle="Internal AI-powered content automation system"
    >
      {/* Quick action links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { href: "/admin/speed-cracker/workflows", label: "Manage Workflows", icon: GitBranch },
          { href: "/admin/speed-cracker/approval-center", label: "Approval Center", icon: CheckSquare },
          { href: "/admin/speed-cracker/vlog-manager", label: "Vlog Manager", icon: Video },
          { href: "/admin/speed-cracker/blog-manager", label: "Blog Manager", icon: FileText },
          { href: "/admin/speed-cracker/analytics", label: "Analytics", icon: BarChart3 },
          { href: "/admin/speed-cracker/settings", label: "Settings", icon: BarChart3 },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <div className="flex items-center gap-3 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl cursor-pointer transition-all group">
              <div className="w-9 h-9 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                <Icon className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex items-center gap-2 text-gray-400 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading stats…</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`p-4 rounded-xl border ${bg}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">Recent Admin Activity</h2>
        </div>
        {logsLoading ? (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading activity…</span>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-500">No activity recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <span className="text-xs font-medium text-white">{log.adminName}</span>
                  <span className="text-xs text-gray-400 ml-1">{ACTION_LABELS[log.action] ?? log.action}</span>
                  {log.targetType && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{log.targetType}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 whitespace-nowrap ml-4">
                  {format(new Date(log.createdAt), "MMM d, HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SpeedCrackerLayout>
  );
}
