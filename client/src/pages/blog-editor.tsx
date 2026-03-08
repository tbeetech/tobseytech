import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";

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
  const { user } = useAuth();
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

  // Load existing post for editing (only when editing and user is admin)
  const { isLoading: loadingPost } = useQuery<BlogPost>({
    queryKey: ["/api/blog", id],
    enabled: isEditing && !!user && user.role === "admin",
    queryFn: async () => {
      const res = await fetch(`/api/blog/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: any) => {
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage ?? "",
        tags: data.tags.join(", "),
        category: data.category,
        published: data.published,
      });
      setSlugManuallyEdited(true);
      return data;
    },
  });

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
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  // Redirect non-admins (after all hooks)
  if (!user || user.role !== "admin") {
    navigate("/auth");
    return null;
  }

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
            <Label className="text-galactic-orange font-orbitron text-sm">Cover Image URL</Label>
            <Input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
              className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
              placeholder="https://example.com/image.jpg"
            />
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
