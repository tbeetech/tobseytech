import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Pencil, Trash2, Calendar, User, Tag } from "lucide-react";
import Navigation from "@/components/Navigation";
import { format } from "date-fns";
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
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/slug/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/blog/${post!.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      navigate("/blog");
      toast({ title: "Post deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete post", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-28 text-center">
          <h1 className="text-3xl font-orbitron font-bold text-galactic-orange mb-4">Post Not Found</h1>
          <Link href="/blog">
            <Button variant="outline" className="border-galactic-orange text-galactic-orange">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <article className="container mx-auto px-6 pt-28 pb-16 max-w-3xl">
        {/* Back link */}
        <Link href="/blog">
          <Button variant="ghost" className="text-galactic-orange hover:text-galactic-gold mb-8 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> All Posts
          </Button>
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="rounded-xl overflow-hidden mb-8 aspect-video">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge className="bg-galactic-orange/20 text-galactic-orange border-galactic-orange/30 font-orbitron">
            {post.category}
          </Badge>
          {user?.role === "admin" && !post.published && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Draft</Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" /> {post.authorName}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(post.createdAt), "MMMM d, yyyy")}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 text-galactic-gold/70">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Admin actions */}
        {user?.role === "admin" && (
          <div className="flex gap-3 mb-8">
            <Link href={`/blog/edit/${post.id}`}>
              <Button size="sm" className="bg-galactic-orange/20 text-galactic-orange border border-galactic-orange/30 hover:bg-galactic-orange hover:text-space-black">
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Delete</>
              )}
            </Button>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-orange max-w-none
            prose-headings:font-orbitron prose-headings:text-white
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-galactic-orange prose-a:no-underline hover:prose-a:underline
            prose-strong:text-galactic-gold
            prose-code:text-galactic-orange prose-code:bg-space-dark prose-code:px-1 prose-code:rounded
            prose-pre:bg-space-dark prose-pre:border prose-pre:border-white/10
            prose-blockquote:border-l-galactic-orange prose-blockquote:text-gray-400
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-hr:border-white/10"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />
      </article>
    </div>
  );
}

// Very lightweight markdown-like renderer (headings, bold, italic, code, links, line breaks)
function markdownToHtml(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(?!<[hulo])(.+)$/gm, "<p>$1</p>");
}
