import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Video, Plus, Trash2, Eye, EyeOff, ExternalLink, Edit3, X, Check,
} from "lucide-react";
import { format } from "date-fns";
import type { VlogPost } from "../../../shared/schema";

const EMBED_PLATFORMS = ["YouTube", "TikTok", "Vimeo", "Instagram", "Facebook", "Dailymotion"] as const;

function getEmbedHtml(embedUrl: string, platform: string): string {
  try {
    const url = new URL(embedUrl);
    if (platform === "YouTube") {
      let videoId = url.searchParams.get("v");
      if (!videoId) videoId = url.pathname.split("/").pop() ?? "";
      return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
    if (platform === "Vimeo") {
      const id = url.pathname.split("/").pop() ?? "";
      return `<iframe src="https://player.vimeo.com/video/${id}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
    }
  } catch { /* ignore */ }
  return `<iframe src="${embedUrl}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`;
}

export default function AdminSpeedCrackerVlogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    embedUrl: "",
    embedPlatform: "YouTube" as (typeof EMBED_PLATFORMS)[number],
    thumbnail: "",
    category: "General",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    published: false,
  });

  const { data: vlogs = [], isLoading } = useQuery<VlogPost[]>({
    queryKey: ["/api/speed-cracker/vlogs"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/vlogs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) + "-" + Date.now();
      return apiRequest("POST", "/api/speed-cracker/vlogs", {
        ...form,
        slug,
        thumbnail: form.thumbnail || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/vlogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Vlog post created" });
      setCreating(false);
      setForm({ title: "", slug: "", description: "", embedUrl: "", embedPlatform: "YouTube", thumbnail: "", category: "General", tags: "", seoTitle: "", seoDescription: "", published: false });
    },
    onError: () => toast({ title: "Failed to create vlog post", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VlogPost> }) =>
      apiRequest("PATCH", `/api/speed-cracker/vlogs/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/vlogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Vlog updated" });
      setEditingId(null);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/speed-cracker/vlogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/vlogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Vlog deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  if (user?.role !== "admin") return null;

  return (
    <SpeedCrackerLayout title="Vlog Manager" subtitle="Manage embedded video content — no local storage used">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{vlogs.length} vlog post{vlogs.length !== 1 ? "s" : ""}</p>
        <Button
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
          onClick={() => setCreating(true)}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Vlog Post
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">New Vlog Post</h3>
            <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 text-xs">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Video title"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Embed URL *</Label>
              <Input
                value={form.embedUrl}
                onChange={(e) => setForm((p) => ({ ...p, embedUrl: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Platform *</Label>
              <select
                value={form.embedPlatform}
                onChange={(e) => setForm((p) => ({ ...p, embedPlatform: e.target.value as any }))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 mt-1 text-sm"
              >
                {EMBED_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Technology, Entertainment…"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-gray-300 text-xs">Description *</Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 mt-1 text-sm resize-none"
                rows={3}
                placeholder="Video description…"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Tags (comma separated)</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="tech, ai, tutorial"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">Thumbnail URL</Label>
              <Input
                value={form.thumbnail}
                onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="https://…"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">SEO Title</Label>
              <Input
                value={form.seoTitle}
                onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs">SEO Description</Label>
              <Input
                value={form.seoDescription}
                onChange={(e) => setForm((p) => ({ ...p, seoDescription: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pub-check"
                checked={form.published}
                onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="pub-check" className="text-gray-300 text-sm cursor-pointer">Publish immediately</Label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.title || !form.embedUrl || !form.description}
            >
              {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
              Create
            </Button>
            <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading vlogs…</span>
        </div>
      ) : vlogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-700">
          <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-medium">No vlog posts yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first vlog entry or approve content in the Approval Center.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vlogs.map((v) => (
            <div key={v.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-4">
                {v.thumbnail && (
                  <img src={v.thumbnail} alt={v.title} className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{v.embedPlatform}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{v.category}</span>
                    {v.published ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">Published</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Draft</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{v.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{v.description}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{format(new Date(v.createdAt), "MMM d, yyyy")}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs px-2 ${v.published ? "border-yellow-500/40 text-yellow-400" : "border-green-500/40 text-green-400"}`}
                    onClick={() => updateMutation.mutate({ id: v.id, updates: { published: !v.published } })}
                    disabled={updateMutation.isPending}
                  >
                    {v.published ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {v.published ? "Unpublish" : "Publish"}
                  </Button>
                  <a href={v.embedUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="text-gray-400 h-7 text-xs px-2">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 h-7 text-xs px-2"
                    onClick={() => deleteMutation.mutate(v.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SpeedCrackerLayout>
  );
}
