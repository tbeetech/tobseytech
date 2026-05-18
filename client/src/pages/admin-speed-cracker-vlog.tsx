import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateSlug } from "@/lib/utils";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, Video, Plus, Trash2, Eye, EyeOff, ExternalLink, X, Check,
  Sparkles, Link2, ChevronDown, ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import type { VlogPost } from "../../../shared/schema";

const EMBED_PLATFORMS = [
  "YouTube", "TikTok", "Vimeo", "Instagram", "Facebook", "Dailymotion", "Twitter", "LinkedIn",
] as const;

type EmbedPlatform = (typeof EMBED_PLATFORMS)[number];

function detectPlatform(url: string): EmbedPlatform {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")) return "YouTube";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "TikTok";
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "Vimeo";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch") return "Facebook";
    if (host === "dailymotion.com" || host.endsWith(".dailymotion.com")) return "Dailymotion";
    if (host === "twitter.com" || host.endsWith(".twitter.com") || host === "x.com" || host.endsWith(".x.com")) return "Twitter";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "LinkedIn";
  } catch { /* ignore */ }
  return "YouTube";
}

const BLANK_FORM = {
  title: "",
  slug: "",
  description: "",
  embedUrl: "",
  embedPlatform: "YouTube" as EmbedPlatform,
  thumbnail: "",
  category: "Technology",
  tags: "",
  seoTitle: "",
  seoDescription: "",
  published: false,
};

export default function AdminSpeedCrackerVlogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [generatingMeta, setGeneratingMeta] = useState(false);

  const { data: vlogs = [], isLoading } = useQuery<VlogPost[]>({
    queryKey: ["/api/speed-cracker/vlogs"],
    queryFn: async () => {
      const res = await fetch("/api/speed-cracker/vlogs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  async function handleUrlChange(url: string) {
    setForm((p) => ({ ...p, embedUrl: url, embedPlatform: detectPlatform(url) }));
  }

  async function handleGenerateMeta() {
    if (!form.embedUrl) return;
    setGeneratingMeta(true);
    try {
      const res = await fetch("/api/speed-cracker/vlogs/generate-meta", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.embedUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      const meta = await res.json();
      setForm((p) => ({
        ...p,
        title: meta.title || p.title,
        description: meta.description || p.description,
        category: meta.category || p.category,
        tags: Array.isArray(meta.tags) ? meta.tags.join(", ") : p.tags,
        thumbnail: meta.thumbnail || p.thumbnail,
        embedPlatform: (meta.platform as EmbedPlatform) || p.embedPlatform,
        slug: meta.title ? generateSlug(meta.title) : p.slug,
        seoTitle: meta.title || p.seoTitle,
        seoDescription: meta.description ? meta.description.slice(0, 160) : p.seoDescription,
      }));
      toast({ title: "Metadata generated ✓" });
    } catch {
      toast({ title: "Could not generate metadata, fill in manually", variant: "destructive" });
    } finally {
      setGeneratingMeta(false);
    }
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || generateSlug(form.title || "untitled");
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
      setShowAdvanced(false);
      setForm(BLANK_FORM);
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

  const canPost = !!(form.embedUrl && form.title && form.description);

  return (
    <SpeedCrackerLayout title="Vlog" subtitle="Tech video central, paste any link, AI does the rest">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{vlogs.length} vlog post{vlogs.length !== 1 ? "s" : ""}</p>
        <Button
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
          onClick={() => { setCreating(true); setShowAdvanced(false); }}
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Video Post
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-yellow-400" />
              <h3 className="font-semibold text-white">New Video Post</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={() => { setCreating(false); setForm(BLANK_FORM); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Step 1: URL */}
          <div className="mb-4">
            <Label className="text-gray-300 text-xs mb-1 block">
              Step 1, Paste your video link *
            </Label>
            <div className="flex gap-2">
              <Input
                value={form.embedUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white flex-1"
                placeholder="YouTube, TikTok, Twitter, LinkedIn, Instagram, Facebook…"
              />
              <Button
                size="sm"
                variant="outline"
                className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10 whitespace-nowrap flex-shrink-0"
                onClick={handleGenerateMeta}
                disabled={!form.embedUrl || generatingMeta}
              >
                {generatingMeta ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                )}
                {generatingMeta ? "Generating…" : "AI Fill"}
              </Button>
            </div>
            {form.embedPlatform && form.embedUrl && (
              <p className="text-[11px] text-gray-500 mt-1">
                Detected: <span className="text-yellow-400">{form.embedPlatform}</span>
              </p>
            )}
          </div>

          {/* Step 2: Title & Description */}
          <div className="mb-4 grid grid-cols-1 gap-4">
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Step 2, Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value, slug: generateSlug(e.target.value) }))}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Video title (AI can fill this)"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1 block">Step 2, Description * <span className="text-gray-500">(AI-generated or write your own)</span></Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="Paste the link above and click AI Fill, or write a summary…"
              />
            </div>
          </div>

          {/* Platform override */}
          <div className="mb-4">
            <Label className="text-gray-300 text-xs mb-1 block">Platform</Label>
            <select
              value={form.embedPlatform}
              onChange={(e) => setForm((p) => ({ ...p, embedPlatform: e.target.value as EmbedPlatform }))}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm"
            >
              {EMBED_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Advanced / optional fields */}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAdvanced ? "Hide" : "Show"} advanced options
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t border-gray-800 pt-4">
              <div>
                <Label className="text-gray-300 text-xs">Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  placeholder="Technology, AI, Programming…"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs">Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  placeholder="ai, dev, tutorial"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs">Thumbnail URL</Label>
                <Input
                  value={form.thumbnail}
                  onChange={(e) => setForm((p) => ({ ...p, thumbnail: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  placeholder="https://… (auto-filled for YouTube)"
                />
              </div>
              <div>
                <Label className="text-gray-300 text-xs">Custom Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  placeholder="auto-generated from title"
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
            </div>
          )}

          {/* Publish toggle + action */}
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                className="rounded"
              />
              <span className="text-gray-300 text-sm">Publish immediately</span>
            </label>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => { setCreating(false); setForm(BLANK_FORM); }}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !canPost}
              >
                {createMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                Post Video
              </Button>
            </div>
          </div>

          {(() => {
            const missingField = !form.title ? "Add a title" : !form.description ? "Add a description" : "";
            return !canPost && form.embedUrl && missingField ? (
              <p className="text-[11px] text-gray-500 mt-2">
                {missingField}, or click <strong className="text-yellow-400">AI Fill</strong> to auto-generate
              </p>
            ) : null;
          })()}
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
          <p className="text-sm text-gray-400 mt-1">Click "New Video Post", paste any video link, and hit "AI Fill" to auto-generate the description.</p>
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

