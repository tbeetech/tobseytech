/**
 * Dedicated page for manually posting an embedded video link to the Vlog.
 * Supports YouTube, TikTok, Twitter/X, LinkedIn, Instagram, Threads, Facebook,
 * Vimeo, Dailymotion and more.  Prophet AI can auto-generate a title, description,
 * category, and tags from any video URL.
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateSlug } from "@/lib/utils";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Video,
  Sparkles,
  Link2,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Check,
} from "lucide-react";

const EMBED_PLATFORMS = [
  "YouTube",
  "TikTok",
  "Twitter/X",
  "LinkedIn",
  "Instagram",
  "Threads",
  "Facebook",
  "Vimeo",
  "Dailymotion",
  "Other",
] as const;

type EmbedPlatform = (typeof EMBED_PLATFORMS)[number];

function detectPlatform(url: string): EmbedPlatform {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")) return "YouTube";
    if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "TikTok";
    if (host === "twitter.com" || host.endsWith(".twitter.com") || host === "x.com" || host.endsWith(".x.com")) return "Twitter/X";
    if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return "LinkedIn";
    if (host === "instagram.com" || host.endsWith(".instagram.com")) return "Instagram";
    if (host === "threads.net" || host.endsWith(".threads.net")) return "Threads";
    if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch") return "Facebook";
    if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "Vimeo";
    if (host === "dailymotion.com" || host.endsWith(".dailymotion.com")) return "Dailymotion";
  } catch { /* ignore */ }
  return "Other";
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
  published: true,
};

export default function AdminSpeedCrackerPostVideoPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState(BLANK_FORM);
  const [generatingMeta, setGeneratingMeta] = useState(false);

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
        title:       meta.title       || p.title,
        description: meta.description || p.description,
        category:    meta.category    || p.category,
        tags:        Array.isArray(meta.tags) ? meta.tags.join(", ") : p.tags,
        thumbnail:   meta.thumbnail   || p.thumbnail,
        embedPlatform: (meta.platform as EmbedPlatform) || p.embedPlatform,
        slug:        meta.title ? generateSlug(meta.title) : p.slug,
        seoTitle:    meta.title || p.seoTitle,
        seoDescription: meta.description ? meta.description.slice(0, 160) : p.seoDescription,
      }));
      toast({ title: "Prophet AI generated metadata!" });
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
        embedPlatform: form.embedPlatform === "Twitter/X" ? "Twitter" : form.embedPlatform,
        slug,
        thumbnail: form.thumbnail || null,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/vlogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/speed-cracker/stats"] });
      toast({ title: "Video posted to Vlog!", description: form.published ? "Now live on /vlog." : "Saved as draft." });
      setForm(BLANK_FORM);
      navigate("/admin/speed-cracker/vlog");
    },
    onError: () => toast({ title: "Failed to post video", variant: "destructive" }),
  });

  if (user?.role !== "admin") return null;

  const canPost = !!(form.embedUrl && form.title && form.description);

  return (
    <SpeedCrackerLayout title="Post Video" subtitle="Manually post an embedded video link to the Vlog with AI-generated or custom write-up">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("/admin/speed-cracker/vlog")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vlog Manager
        </button>

        <div className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Video className="w-5 h-5 text-yellow-400" />
            <h2 className="font-semibold text-white text-lg">New Video Post</h2>
          </div>

          {/* Step 1: Video URL */}
          <div className="mb-5">
            <Label className="text-gray-300 text-xs mb-1.5 block">
              Step 1, Paste video link *{" "}
              <span className="text-gray-500">
                (YouTube, TikTok, Twitter/X, LinkedIn, Instagram, Threads, Facebook, Vimeo…)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={form.embedUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white flex-1"
                placeholder="Paste any video URL here…"
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
                {generatingMeta ? "Generating…" : "Prophet AI Fill"}
              </Button>
            </div>
            {form.embedUrl && (
              <p className="text-[11px] text-gray-500 mt-1.5">
                Platform detected:{" "}
                <span className="text-yellow-400 font-medium">{form.embedPlatform}</span>
              </p>
            )}
          </div>

          {/* Step 2: Platform */}
          <div className="mb-5">
            <Label className="text-gray-300 text-xs mb-1.5 block">Step 2, Confirm platform</Label>
            <div className="flex flex-wrap gap-2">
              {EMBED_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, embedPlatform: p }))}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    form.embedPlatform === p
                      ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-300"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Title & Write-up */}
          <div className="mb-5 space-y-4">
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">Step 3, Title *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value, slug: generateSlug(e.target.value) }))
                }
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Video title (Prophet AI can fill this)"
              />
            </div>
            <div>
              <Label className="text-gray-300 text-xs mb-1.5 block">
                Write-up / Summary *{" "}
                <span className="text-gray-500">
                  (write your own or use Prophet AI to generate)
                </span>
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-yellow-500/50"
                rows={5}
                placeholder="Write a summary of this video, or click Prophet AI Fill above to generate one automatically…"
              />
            </div>
          </div>

          {/* Advanced options */}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 mb-4 transition-colors"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showAdvanced ? "Hide" : "Show"} advanced options
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 border-t border-gray-800 pt-4">
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
                <Label className="text-gray-300 text-xs">Tags (comma-separated)</Label>
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

          {/* Publish toggle + submit */}
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
                className="rounded accent-yellow-500"
              />
              <span className="text-gray-300 text-sm">Publish immediately</span>
            </label>
            <Button
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !canPost}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {form.published ? "Publish Video" : "Save as Draft"}
            </Button>
          </div>

          {!canPost && form.embedUrl && (
            <p className="text-[11px] text-gray-500 mt-3">
              {!form.title ? "Add a title" : "Add a description"}, or click{" "}
              <strong className="text-yellow-400">Prophet AI Fill</strong> to auto-generate
            </p>
          )}
        </div>
      </div>
    </SpeedCrackerLayout>
  );
}
