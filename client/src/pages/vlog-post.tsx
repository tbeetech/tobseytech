import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SharePostDialog } from "@/components/share-post-dialog";
import {
  Loader2, ArrowLeft, Video, Calendar, Tag, ExternalLink,
  Heart, Bookmark, MessageSquare, Send, Trash2, Lightbulb,
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import type { VlogPost } from "../../../shared/schema";

interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

function getEmbedSrc(embedUrl: string, platform: string): string | null {
  try {
    const url = new URL(embedUrl);
    if (platform === "YouTube") {
      let videoId = url.searchParams.get("v");
      if (!videoId) {
        // handles youtu.be/ID, /shorts/ID, /embed/ID
        const parts = url.pathname.split("/").filter(Boolean);
        videoId = parts[parts.length - 1] ?? null;
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (platform === "Vimeo") {
      const id = url.pathname.split("/").filter(Boolean).pop() ?? "";
      return `https://player.vimeo.com/video/${id}`;
    }
    if (platform === "Dailymotion") {
      const id = url.pathname.split("/").filter(Boolean).pop() ?? "";
      return `https://www.dailymotion.com/embed/video/${id}`;
    }
    if (platform === "TikTok") {
      // https://www.tiktok.com/@user/video/1234567890
      const parts = url.pathname.split("/").filter(Boolean);
      const videoIdx = parts.indexOf("video");
      const videoId = videoIdx !== -1 ? parts[videoIdx + 1] : parts[parts.length - 1];
      return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : null;
    }
    if (platform === "Facebook") {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(embedUrl)}&show_text=0&width=560`;
    }
  } catch { /* ignore */ }
  // Twitter, LinkedIn, Instagram, no reliable iframe embed; return null to show external link
  return null;
}

export default function VlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");

  const { data: vlog, isLoading, isError } = useQuery<VlogPost>({
    queryKey: [`/api/vlog/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/vlog/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: related = [] } = useQuery<VlogPost[]>({
    queryKey: ["/api/vlog"],
    queryFn: async () => {
      const res = await fetch("/api/vlog");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: likeData, refetch: refetchLikes } = useQuery<{ count: number; liked: boolean }>({
    queryKey: [`/api/vlog/${vlog?.id}/likes`],
    queryFn: async () => {
      if (!vlog) return { count: 0, liked: false };
      const res = await fetch(`/api/vlog/${vlog.id}/likes`, { credentials: "include" });
      if (!res.ok) return { count: 0, liked: false };
      return res.json();
    },
    enabled: !!vlog,
  });

  const { data: bookmarkData, refetch: refetchBookmark } = useQuery<{ bookmarked: boolean }>({
    queryKey: [`/api/vlog/${vlog?.id}/bookmark`],
    queryFn: async () => {
      if (!vlog || !user) return { bookmarked: false };
      const res = await fetch(`/api/vlog/${vlog.id}/bookmark`, { credentials: "include" });
      if (!res.ok) return { bookmarked: false };
      return res.json();
    },
    enabled: !!vlog && !!user,
  });

  const { data: comments = [], refetch: refetchComments } = useQuery<Comment[]>({
    queryKey: [`/api/vlog/${vlog?.id}/comments`],
    queryFn: async () => {
      if (!vlog) return [];
      const res = await fetch(`/api/vlog/${vlog.id}/comments`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!vlog,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!vlog) return;
      if (likeData?.liked) {
        await apiRequest("DELETE", `/api/vlog/${vlog.id}/likes`);
      } else {
        await apiRequest("POST", `/api/vlog/${vlog.id}/likes`);
      }
    },
    onSuccess: () => refetchLikes(),
    onError: () => {
      if (!user) toast({ title: "Sign in to like videos", variant: "destructive" });
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (!vlog) return;
      if (bookmarkData?.bookmarked) {
        await apiRequest("DELETE", `/api/vlog/${vlog.id}/bookmark`);
      } else {
        await apiRequest("POST", `/api/vlog/${vlog.id}/bookmark`);
      }
    },
    onSuccess: () => refetchBookmark(),
    onError: () => {
      if (!user) toast({ title: "Sign in to bookmark videos", variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!vlog) return;
      await apiRequest("POST", `/api/vlog/${vlog.id}/comments`, { content: commentText });
    },
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      toast({ title: "Comment posted!" });
    },
    onError: () => toast({ title: "Failed to post comment", variant: "destructive" }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => refetchComments(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black text-foreground">
        <Navigation />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        </div>
      </div>
    );
  }

  if (isError || !vlog) {
    return (
      <div className="min-h-screen bg-space-black text-foreground">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-32 text-center">
          <Video className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Video not found</h1>
          <p className="text-muted-foreground mb-6">The vlog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/vlog">
            <span className="text-neon-cyan hover:underline cursor-pointer">← Back to Vlog</span>
          </Link>
        </div>
      </div>
    );
  }

  const embedSrc = getEmbedSrc(vlog.embedUrl, vlog.embedPlatform);
  const relatedVlogs = related.filter((v) => v.id !== vlog.id && v.category === vlog.category).slice(0, 3);

  // Auto-extract key takeaways: first 4 sentences longer than 20 chars
  const keyTakeaways = vlog.description
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-space-black text-foreground">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back link */}
        <Link href="/vlog">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Vlog
          </div>
        </Link>

        {/* Meta */}
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-xs text-neon-cyan font-semibold uppercase tracking-wider">{vlog.category}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(vlog.createdAt), "MMMM d, yyyy")}
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">{vlog.embedPlatform}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3">{vlog.title}</h1>
          <p className="text-muted-foreground text-base leading-relaxed">{vlog.description}</p>
        </div>

        {/* Embedded video player */}
        <div className="rounded-xl overflow-hidden bg-black border border-border mb-6 aspect-video">
          {embedSrc ? (
            <iframe
              src={embedSrc}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title={vlog.title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Video className="w-12 h-12 text-muted-foreground" />
              <a
                href={vlog.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neon-cyan hover:underline flex items-center gap-1"
              >
                Watch on {vlog.embedPlatform}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Social action buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
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

          {vlog.published && (
            <SharePostDialog postSlug={`vlog/${vlog.slug}`} postTitle={vlog.title} />
          )}
        </div>

        {/* Key Takeaways */}
        {keyTakeaways.length > 0 && (
          <div className="bg-muted/50 border border-border rounded-xl p-5 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-neon-cyan" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Key Takeaways</h3>
            </div>
            <ul className="space-y-2">
              {keyTakeaways.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-neon-cyan font-bold mt-0.5">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {vlog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {vlog.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments section */}
        <div className="mt-8 pt-8 border-t border-border">
          <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-cyan" />
            Comments ({comments.length})
          </h2>

          {user ? (
            <div className="glass-effect rounded-xl p-5 mb-6">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="border-galactic-orange/40 text-foreground resize-none mb-3"
              />
              <Button
                onClick={() => commentMutation.mutate()}
                disabled={!commentText.trim() || commentMutation.isPending}
                className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all"
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
            <div className="glass-effect rounded-xl p-5 mb-6 text-center">
              <p className="text-muted-foreground mb-3">Sign in to leave a comment</p>
              <Link href="/auth">
                <Button size="sm" className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8 text-sm">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-card group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-neon-cyan text-xs font-bold" style={{ background: "rgba(0,212,255,0.15)" }}>
                        {comment.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm text-neon-cyan font-medium">{comment.username}</span>
                        <span className="text-muted-foreground text-xs ml-2">
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
                  <p className="text-foreground/80 text-sm leading-relaxed pl-11">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related vlogs */}
        {relatedVlogs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">More in {vlog.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedVlogs.map((rv) => (
                <Link key={rv.id} href={`/vlog/${rv.slug}`}>
                  <div className="bg-muted/50 rounded-xl overflow-hidden border border-border hover:border-neon-cyan/40 transition-all cursor-pointer group">
                    <div className="aspect-video bg-muted relative">
                      {rv.thumbnail ? (
                        <img src={rv.thumbnail} alt={rv.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-neon-cyan transition-colors">{rv.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(rv.createdAt), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
