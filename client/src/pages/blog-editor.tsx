import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Save, Upload, Link as LinkIcon, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";

/** Compress a file using the Canvas API and return a base64 data URI. */
async function compressImage(file: File, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
  category: string;
  published: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function BlogEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    category: "",
    published: false,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imageMode, setImageMode] = useState<"url" | "file">("url");
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect unauthenticated users after auth check completes
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  // Load existing post for editing
  const { isLoading: loadingPost, data: postData } = useQuery<BlogPost>({
    queryKey: ["/api/blog", id],
    enabled: isEditing && !!user,
    queryFn: async () => {
      const res = await fetch(`/api/blog/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
  });

  // Populate the form once the fetched post data is available.
  // This must be a useEffect (not a select side-effect) because calling
  // setState inside React Query's select runs during the render phase,
  // which React 18 forbids and throws minified error #301.
  useEffect(() => {
    if (!postData) return;
    setForm({
      title: postData.title ?? "",
      slug: postData.slug ?? "",
      excerpt: postData.excerpt ?? "",
      content: postData.content ?? "",
      coverImage: postData.coverImage ?? "",
      tags: Array.isArray(postData.tags) ? postData.tags.join(", ") : "",
      category: postData.category ?? "",
      published: postData.published ?? false,
    });
    setSlugManuallyEdited(true);
    // If the stored image is a data URI (uploaded file), switch to upload mode
    if (postData.coverImage?.startsWith("data:")) {
      setImageMode("file");
    }
  }, [postData]);

  const mutation = useMutation({
    mutationFn: async (payload: object) => {
      if (isEditing) {
        const res = await apiRequest("PATCH", `/api/blog/${id}`, payload);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/blog", payload);
        return res.json();
      }
    },
    onSuccess: (data: BlogPost) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      toast({ title: isEditing ? "Post updated!" : "Post created!" });
      navigate(`/blog/${data.slug}`);
    },
    onError: (err: any) => {
      toast({ title: "Save failed", description: err?.message || "An error occurred. Please try again.", variant: "destructive" });
    },
  });

  // Show loading while auth check is in progress
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
      </div>
    );
  }

  const handleRemoveImage = () => {
    setForm((f) => ({ ...f, coverImage: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: f.slug === "" || !slugManuallyEdited ? slugify(title) : f.slug,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    mutation.mutate({
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      coverImage: form.coverImage || null,
      tags,
      category: form.category,
      published: form.published,
    });
  };

  if (isEditing && loadingPost) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">
        <Link href="/blog">
          <Button variant="ghost" className="text-galactic-orange hover:text-galactic-gold mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
          </Button>
        </Link>

        <h1 className="text-3xl font-orbitron font-bold gradient-text mb-8">
          {isEditing ? "Edit Post" : "New Post"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
              placeholder="Post title"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setForm({ ...form, slug: slugify(e.target.value) });
              }}
              required
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange font-mono text-sm"
              placeholder="my-post-slug"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">Category *</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
              placeholder="e.g. AI, Web Dev, Cloud"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">Excerpt *</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              required
              rows={3}
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange resize-none"
              placeholder="A short description of the post"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">
              Content * <span className="text-gray-400 text-xs font-sans">(Markdown supported)</span>
            </Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
              rows={16}
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange resize-y font-mono text-sm"
              placeholder="Write your post in Markdown..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">Cover Image</Label>
            {/* Toggle between URL and file upload */}
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                size="sm"
                variant={imageMode === "url" ? "default" : "outline"}
                className={imageMode === "url" ? "bg-galactic-orange text-space-black font-orbitron text-xs" : "border-galactic-orange/40 text-galactic-orange font-orbitron text-xs"}
                onClick={() => setImageMode("url")}
              >
                <LinkIcon className="w-3 h-3 mr-1" /> URL
              </Button>
              <Button
                type="button"
                size="sm"
                variant={imageMode === "file" ? "default" : "outline"}
                className={imageMode === "file" ? "bg-galactic-orange text-space-black font-orbitron text-xs" : "border-galactic-orange/40 text-galactic-orange font-orbitron text-xs"}
                onClick={() => setImageMode("file")}
              >
                <Upload className="w-3 h-3 mr-1" /> Upload
              </Button>
            </div>

            {imageMode === "url" ? (
              <Input
                type="url"
                value={form.coverImage.startsWith("data:") ? "" : form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
                placeholder="https://example.com/image.jpg"
              />
            ) : (
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setCompressing(true);
                    try {
                      const dataUri = await compressImage(file);
                      setForm((f) => ({ ...f, coverImage: dataUri }));
                      toast({ title: "Image compressed and ready" });
                    } catch (err) {
                      toast({ title: "Image processing failed", description: (err as Error)?.message || "Could not process the image. Try a different file.", variant: "destructive" });
                    } finally {
                      setCompressing(false);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron text-xs"
                  disabled={compressing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {compressing ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Compressing…</>
                  ) : (
                    <><Upload className="w-3 h-3 mr-1" /> Choose File</>
                  )}
                </Button>
                {form.coverImage.startsWith("data:") && (
                  <span className="text-green-400 text-xs font-orbitron">✓ Image ready</span>
                )}
              </div>
            )}

            {/* Preview */}
            {form.coverImage && (
              <div className="relative mt-2 w-full max-w-sm">
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="rounded-md border border-galactic-orange/20 object-cover w-full max-h-40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    toast({ title: "Image preview failed", description: "The image URL may be invalid or blocked.", variant: "destructive" });
                  }}
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white hover:bg-black/80"
                  onClick={handleRemoveImage}
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-galactic-orange font-orbitron text-sm">
              Tags <span className="text-gray-400 text-xs font-sans">(comma-separated)</span>
            </Label>
            <Input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
              placeholder="React, MongoDB, Node.js"
            />
          </div>

          {user.role === "admin" && (
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
              <Label htmlFor="published" className="text-white font-orbitron text-sm cursor-pointer">
                {form.published ? "Published" : "Draft"}
              </Label>
            </div>
          )}
          {user.role !== "admin" && (
            <p className="text-sm text-gray-400 font-orbitron">
              Your post will be saved as a draft for admin review before publishing.
            </p>
          )}

          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <><Save className="w-4 h-4 mr-2" /> {isEditing ? "Update Post" : "Publish Post"}</>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
