import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, CheckCircle, XCircle, Eye, RefreshCw, CheckSquare, Video, FileText, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import type { SportaCampaign, SportaContent } from "../../../shared/schema";

export default function AdminSpeedCrackerApprovalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<string | "all">("all");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [previewItem, setPreviewItem] = useState<SportaContent | null>(null);

  const { data: campaigns = [] } = useQuery<SportaCampaign[]>({
    queryKey: ["/api/sporta/campaigns"],
    queryFn: async () => {
      const res = await fetch("/api/sporta/campaigns", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const { data: allContent = [], isLoading } = useQuery<SportaContent[]>({
    queryKey: ["/api/speed-cracker/pending-content"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/pending-content", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/speed-cracker/content/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/pending-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Content approved" });
    },
    onError: () => toast({ title: "Failed to approve", variant: "destructive" }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/speed-cracker/content/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/pending-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Content rejected" });
    },
    onError: () => toast({ title: "Failed to reject", variant: "destructive" }),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/speed-cracker/content/bulk-approve", { ids: Array.from(selectedItems) }),
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/pending-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: `Approved ${data.approved} items` });
      setSelectedItems(new Set());
    },
    onError: () => toast({ title: "Bulk approve failed", variant: "destructive" }),
  });

  const bulkRejectMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/speed-cracker/content/bulk-reject", { ids: Array.from(selectedItems) }),
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/pending-content"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: `Rejected ${data.rejected} items` });
      setSelectedItems(new Set());
    },
    onError: () => toast({ title: "Bulk reject failed", variant: "destructive" }),
  });

  const toVlogMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/speed-cracker/vlogs/from-content/${id}`, { category: "General" }),
    onSuccess: () => {
      toast({ title: "Vlog entry created, edit in Vlog Manager" });
    },
    onError: () => toast({ title: "Failed to create vlog entry", variant: "destructive" }),
  });

  const toBlogMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/speed-cracker/blog/from-content/${id}`, { category: "General" }),
    onSuccess: () => {
      toast({ title: "Blog draft created, edit in Blog Manager" });
    },
    onError: () => toast({ title: "Failed to create blog post", variant: "destructive" }),
  });

  if (user?.role !== "admin") return null;

  const filtered = selectedCampaign === "all"
    ? allContent
    : allContent.filter((c) => c.campaignId === selectedCampaign);

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedItems.size === filtered.length) setSelectedItems(new Set());
    else setSelectedItems(new Set(filtered.map((c) => c.id)));
  };

  return (
    <SpeedCrackerLayout title="Approval Center" subtitle="Review, approve and publish queued content">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-sm text-white rounded-lg px-3 py-2 focus:outline-none"
        >
          <option value="all">All Campaigns</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <Button
          size="sm"
          variant="outline"
          className="border-gray-700 text-gray-300"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/all-pending"] });
          }}
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>

        {selectedItems.size > 0 && (
          <>
            <span className="text-sm text-gray-400">{selectedItems.size} selected</span>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-500 text-white"
              onClick={() => bulkApproveMutation.mutate()}
              disabled={bulkApproveMutation.isPending}
            >
              {bulkApproveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <CheckCircle className="w-3.5 h-3.5 mr-1" />}
              Bulk Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10"
              onClick={() => bulkRejectMutation.mutate()}
              disabled={bulkRejectMutation.isPending}
            >
              {bulkRejectMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <XCircle className="w-3.5 h-3.5 mr-1" />}
              Bulk Reject
            </Button>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading content queue…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-700">
          <CheckSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-medium">Queue is clear!</p>
          <p className="text-sm text-gray-400 mt-1">No pending content to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 text-xs text-gray-500 uppercase tracking-wider">
            <input
              type="checkbox"
              checked={selectedItems.size === filtered.length && filtered.length > 0}
              onChange={toggleAll}
              className="rounded"
            />
            <span className="flex-1">Content</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-gray-900 border rounded-xl p-4 transition-colors ${
                selectedItems.has(item.id) ? "border-yellow-500/40" : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItem(item.id)}
                  className="mt-1 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{item.sourcePlatform}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{item.mediaType}</span>
                    {item.aiQualityScore != null && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                        Quality: {item.aiQualityScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">
                    {item.aiRewrittenTitle || item.originalTitle || "Untitled"}
                  </p>
                  {item.aiRewrittenContent && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.aiRewrittenContent}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.aiGeneratedHashtags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] text-cyan-400">#{tag}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {format(new Date(item.createdAt), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-500 text-white h-7 text-xs px-2"
                    onClick={() => approveMutation.mutate(item.id)}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 h-7 text-xs px-2"
                    onClick={() => rejectMutation.mutate(item.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-500/40 text-purple-400 h-7 text-xs px-2"
                    onClick={() => toVlogMutation.mutate(item.id)}
                    disabled={toVlogMutation.isPending}
                    title="Create Vlog entry"
                  >
                    <Video className="w-3 h-3 mr-1" />
                    → Vlog
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-cyan-500/40 text-cyan-400 h-7 text-xs px-2"
                    onClick={() => toBlogMutation.mutate(item.id)}
                    disabled={toBlogMutation.isPending}
                    title="Create Blog post"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    → Blog
                  </Button>
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 h-7 text-xs px-2 w-full"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Source
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SpeedCrackerLayout>
  );
}
