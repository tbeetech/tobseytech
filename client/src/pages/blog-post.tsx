import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, ArrowLeft, Pencil, Trash2, Calendar, User, Tag,
  Heart, Bookmark, MessageSquare, Send, Lightbulb, X, Check,
} from "lucide-react";
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
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [showSuggestForm, setShowSuggestForm] = useState(false);
  const [suggestReason, setSuggestReason] = useState("");
  const [suggestTitle, setSuggestTitle] = useState("");
  const [suggestContent, setSuggestContent] = useState("");

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog/slug", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blog/slug/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
  });

  const { data: likeData, refetch: refetchLikes } = useQuery<{ count: number; liked: boolean }>({
    queryKey: ["/api/blog", post?.id, "likes"],
    queryFn: async () => {
      if (!post) return { count: 0, liked: false };
      const res = await fetch(`/api/blog/${post.id}/likes`, { credentials: "include" });
      return res.json();
    },
    enabled: !!post,
  });

  const { data: bookmarkData, refetch: refetchBookmark } = useQuery<{ bookmarked: boolean }>({
    queryKey: ["/api/blog", post?.id, "bookmark"],
    queryFn: async () => {
      if (!post || !user) return { bookmarked: false };
      const res = await fetch(`/api/blog/${post.id}/bookmark`, { credentials: "include" });
      return res.json();
    },
    enabled: !!post && !!user,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: ["/api/blog", post?.id, "comments"],
    queryFn: async () => {
      if (!post) return [];
      const res = await fetch(`/api/blog/${post.id}/comments`, { credentials: "include" });
      return res.json();
    },
    enabled: !!post,
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

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      if (likeData?.liked) {
        await apiRequest("DELETE", `/api/blog/${post.id}/likes`);
      } else {
        await apiRequest("POST", `/api/blog/${post.id}/likes`);
      }
    },
    onSuccess: () => refetchLikes(),
    onError: () => {
      if (!user) toast({ title: "Sign in to like posts", variant: "destructive" });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      if (bookmarkData?.bookmarked) {
        await apiRequest("DELETE", `/api/blog/${post.id}/bookmark`);
      } else {
        await apiRequest("POST", `/api/blog/${post.id}/bookmark`);
      }
    },
    onSuccess: () => refetchBookmark(),
    onError: () => {
      if (!user) toast({ title: "Sign in to bookmark posts", variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      await apiRequest("POST", `/api/blog/${post.id}/comments`, { content: commentText });
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      toast({ title: "Comment posted!" });
    },
    onError: () => {
      toast({ title: "Failed to post comment", variant: "destructive" });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => refetchComments(),
  });

  const suggestMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      await apiRequest("POST", `/api/blog/${post.id}/suggest`, {
        reason: suggestReason,
        suggestedTitle: suggestTitle || undefined,
        suggestedContent: suggestContent || undefined,
      });
    },
    onSuccess: () => {
      setShowSuggestForm(false);
      setSuggestReason("");
      setSuggestTitle("");
      setSuggestContent("");
      toast({ title: "Suggestion submitted!", description: "The author will review your suggestion." });
    },
    onError: () => {
      toast({ title: "Failed to submit suggestion", variant: "destructive" });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  const isAuthorOrAdmin = user && post && (user.role === "admin" || user.id === (post as any).authorId);

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
            <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10">
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
          <Button variant="ghost" className="text-galactic-orange hover:text-galactic-gold mb-6 -ml-2 font-orbitron text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> All Posts
          </Button>
        </Link>

        {/* Cover image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 aspect-video shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Category + status badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="badge-neon badge-orange">{post.category}</span>
          {!post.published && (
            <span className="badge-neon badge-draft">Draft</span>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-white mb-5 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <Link href={`/profile/${post.authorId}`}>
              <span className="hover:text-galactic-orange transition-colors cursor-pointer">{post.authorName}</span>
            </Link>
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-galactic-orange/70" />
            {format(new Date(post.createdAt), "MMMM d, yyyy")}
          </span>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="badge-neon badge-cyan flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social action buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
            className={`action-btn action-btn-like ${likeData?.liked ? "active" : ""}`}
          >
            <Heart className={`w-4 h-4 ${likeData?.liked ? "fill-current" : ""}`} />
            {likeData?.count ?? 0}
          </button>

          {user && (
            <button
              onClick={() => bookmarkMutation.mutate()}
              disabled={bookmarkMutation.isPending}
              className={`action-btn action-btn-bookmark ${bookmarkData?.bookmarked ? "active" : ""}`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkData?.bookmarked ? "fill-current" : ""}`} />
              {bookmarkData?.bookmarked ? "Saved" : "Save"}
            </button>
          )}

          <div className="action-btn cursor-default">
            <MessageSquare className="w-4 h-4" />
            {comments.length}
          </div>

          {user && !isAuthorOrAdmin && (
            <button
              onClick={() => setShowSuggestForm(!showSuggestForm)}
              className={`action-btn ${showSuggestForm ? "active" : ""}`}
            >
              <Lightbulb className="w-4 h-4" />
              Suggest Edit
            </button>
          )}
        </div>

        {/* Author / admin actions */}
        {isAuthorOrAdmin && (
          <div className="flex gap-3 mb-8">
            <Link href={`/blog/edit/${post.id}`}>
              <Button
                size="sm"
                className="border border-galactic-orange/30 text-galactic-orange hover:bg-galactic-orange hover:text-space-black font-orbitron"
                style={{ background: "rgba(255,165,0,0.08)" }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </Button>
            </Link>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="font-orbitron"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Trash2 className="w-4 h-4 mr-2" /> Delete</>
              )}
            </Button>
          </div>
        )}

        {/* Suggest edit form */}
        {showSuggestForm && (
          <div className="glass-effect rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-orbitron text-galactic-orange flex items-center gap-2 text-sm font-bold">
                <Lightbulb className="w-4 h-4" /> Suggest an Edit
              </h3>
              <button
                onClick={() => setShowSuggestForm(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1 input-glow">
                <Label className="text-galactic-orange/80 font-orbitron text-xs uppercase tracking-wide">
                  Suggested Title (optional)
                </Label>
                <Input
                  value={suggestTitle}
                  onChange={(e) => setSuggestTitle(e.target.value)}
                  placeholder={post.title}
                  className="border-galactic-orange/20 text-white text-sm"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                />
              </div>
              <div className="space-y-1 input-glow">
                <Label className="text-galactic-orange/80 font-orbitron text-xs uppercase tracking-wide">
                  Suggested Content (optional)
                </Label>
                <Textarea
                  value={suggestContent}
                  onChange={(e) => setSuggestContent(e.target.value)}
                  placeholder="Paste your suggested content here..."
                  rows={4}
                  className="border-galactic-orange/20 text-white text-sm resize-none"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                />
              </div>
              <div className="space-y-1 input-glow">
                <Label className="text-galactic-orange/80 font-orbitron text-xs uppercase tracking-wide">
                  Reason *
                </Label>
                <Textarea
                  value={suggestReason}
                  onChange={(e) => setSuggestReason(e.target.value)}
                  placeholder="Why would this edit improve the post?"
                  rows={2}
                  className="border-galactic-orange/20 text-white text-sm resize-none"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                />
              </div>
              <Button
                onClick={() => suggestMutation.mutate()}
                disabled={!suggestReason.trim() || suggestMutation.isPending}
                className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold hover:shadow-[0_0_20px_rgba(255,165,0,0.3)] transition-all"
              >
                {suggestMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Submit Suggestion
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-orange max-w-none
            prose-headings:font-orbitron prose-headings:text-white
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline
            prose-strong:text-galactic-gold
            prose-code:text-galactic-orange prose-code:bg-space-dark prose-code:px-1 prose-code:rounded
            prose-pre:bg-space-dark prose-pre:border prose-pre:border-white/10
            prose-blockquote:border-l-galactic-orange prose-blockquote:text-gray-400
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-hr:border-white/10"
          dangerouslySetInnerHTML={{ __html: markdownToHtml(post.content) }}
        />

        {/* Comments section */}
        <div className="mt-14 pt-8 border-t border-white/8">
          <h2 className="text-xl font-orbitron font-bold text-galactic-orange mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Comments ({comments.length})
          </h2>

          {user ? (
            <div className="glass-effect rounded-xl p-5 mb-8">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="border-galactic-orange/20 text-white resize-none mb-3"
                style={{ background: "rgba(255,165,0,0.03)" }}
              />
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold hover:shadow-[0_0_20px_rgba(255,165,0,0.3)] transition-all"
              >
                {commentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          ) : (
            <div className="glass-effect rounded-xl p-5 mb-8 text-center">
              <p className="text-gray-400 mb-3">Sign in to leave a comment</p>
              <Link href="/auth">
                <Button size="sm" className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-sm">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-card group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-galactic-orange text-xs font-orbitron font-bold" style={{ background: "rgba(255,165,0,0.15)" }}>
                        {comment.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-orbitron text-sm text-galactic-orange">{comment.username}</span>
                        <span className="text-gray-600 text-xs ml-2">
                          {format(new Date(comment.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                    {user?.id === comment.userId && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed pl-11">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

// Lightweight markdown-to-HTML converter
function markdownToHtml(md: string): string {
  const lines = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split("\n");

  const result: string[] = [];
  let inUl = false;

  const closeLists = () => {
    if (inUl) { result.push("</ul>"); inUl = false; }
  };

  for (const rawLine of lines) {
    const line = rawLine
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    if (/^### (.+)$/.test(line)) {
      closeLists();
      result.push(`<h3>${line.replace(/^### /, "")}</h3>`);
    } else if (/^## (.+)$/.test(line)) {
      closeLists();
      result.push(`<h2>${line.replace(/^## /, "")}</h2>`);
    } else if (/^# (.+)$/.test(line)) {
      closeLists();
      result.push(`<h1>${line.replace(/^# /, "")}</h1>`);
    } else if (/^- (.+)$/.test(line)) {
      if (!inUl) { result.push("<ul>"); inUl = true; }
      result.push(`<li>${line.replace(/^- /, "")}</li>`);
    } else if (line.trim() === "") {
      closeLists();
    } else {
      closeLists();
      result.push(`<p>${line}</p>`);
    }
  }
  closeLists();
  return result.join("\n");
}
