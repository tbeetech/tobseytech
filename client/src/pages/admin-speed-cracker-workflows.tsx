import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Play, Pause, Trash2, Plus, RefreshCw, GitBranch, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { format } from "date-fns";
import type { SportaCampaign } from "../../../shared/schema";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  active: { label: "Active", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  paused: { label: "Paused", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  completed: { label: "Completed", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  stopped: { label: "Stopped", color: "bg-red-500/20 text-red-400 border-red-500/30" },
};

export default function AdminSpeedCrackerWorkflowsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: campaigns = [], isLoading } = useQuery<SportaCampaign[]>({
    queryKey: ["/api/sporta/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/campaigns", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load campaigns");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/sporta/campaigns/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sporta/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
    },
    onError: () => toast({ title: "Failed to update campaign", variant: "destructive" }),
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/sporta/campaigns/${id}`);
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sporta/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Campaign deleted" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete campaign", variant: "destructive" });
      setDeletingId(null);
    },
  });

  if (user?.role !== "admin") return null;

  return (
    <SpeedCrackerLayout title="Workflows" subtitle="Manage content aggregation campaigns">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{campaigns.length} workflow{campaigns.length !== 1 ? "s" : ""}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-700 text-gray-300 hover:text-white"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/sporta/campaigns"] })}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
            onClick={() => window.location.href = "/dashboard?tab=sporta"}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading workflows…</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-700">
          <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No workflows yet</p>
          <p className="text-sm text-gray-400 mb-4">Create a SPORTA campaign to get started.</p>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
            onClick={() => window.location.href = "/dashboard?tab=sporta"}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => {
            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.draft;
            return (
              <div key={c.id} className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white truncate">{c.name}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {c.industry}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        {c.postsPublished} published
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        {c.postsAggregated} aggregated
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-400" />
                        {c.postsRejected} rejected
                      </span>
                      <span>Created {format(new Date(c.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.contentTypes.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{t}</span>
                      ))}
                      {c.contentTypes.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">+{c.contentTypes.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {c.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10"
                        onClick={() => updateStatus.mutate({ id: c.id, status: "paused" })}
                        disabled={updateStatus.isPending}
                      >
                        <Pause className="w-3.5 h-3.5 mr-1" />
                        Pause
                      </Button>
                    ) : c.status !== "completed" && c.status !== "stopped" ? (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-500 text-white"
                        onClick={() => updateStatus.mutate({ id: c.id, status: "active" })}
                        disabled={updateStatus.isPending}
                      >
                        <Play className="w-3.5 h-3.5 mr-1" />
                        Launch
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => {
                        setDeletingId(c.id);
                        deleteCampaign.mutate(c.id);
                      }}
                      disabled={deletingId === c.id && deleteCampaign.isPending}
                    >
                      {deletingId === c.id && deleteCampaign.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SpeedCrackerLayout>
  );
}
