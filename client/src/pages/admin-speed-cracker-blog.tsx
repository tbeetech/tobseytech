import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import SpeedCrackerLayout from "@/components/SpeedCrackerLayout";
import { Button } from "@/components/ui/button";
import {
  Loader2, FileText, Eye, EyeOff, Trash2, Edit3, Plus, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import type { BlogPost } from "../../../shared/schema";

export default function AdminSpeedCrackerBlogPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/all"],
    queryFn: async () => {
      const res = await fetch("/api/blog/all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) =>
      apiRequest("PATCH", `/api/blog/${id}`, { published }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      toast({ title: "Post updated" });
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deletePost = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      toast({ title: "Post deleted" });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  if (user?.role !== "admin") return null;

  const published = posts.filter((p) => p.published);
  const drafts = posts.filter((p) => !p.published);

  return (
    <SpeedCrackerLayout title="Blog Manager" subtitle="Manage blog posts created by Speed Cracker workflows">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{published.length} published</span>
          <span>{drafts.length} drafts</span>
        </div>
        <Link href="/blog/new">
          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Post
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading posts…</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl border border-gray-700">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-white font-medium">No blog posts yet</p>
          <p className="text-sm text-gray-400 mt-1">Use the Approval Center to auto-create posts from aggregated content.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div key={post.id} className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">{post.category}</span>
                    {post.published ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">Published</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">Draft</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{post.authorName} · {format(new Date(post.createdAt), "MMM d, yyyy")}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {post.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="text-[10px] text-cyan-400">#{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                  <Link href={`/blog/edit/${post.id}`}>
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-300 h-7 text-xs px-2">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`h-7 text-xs px-2 ${post.published ? "border-yellow-500/40 text-yellow-400" : "border-green-500/40 text-green-400"}`}
                    onClick={() => togglePublished.mutate({ id: post.id, published: !post.published })}
                    disabled={togglePublished.isPending}
                  >
                    {post.published ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                    {post.published ? "Unpublish" : "Publish"}
                  </Button>
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost" className="text-gray-400 h-7 text-xs px-2">
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 h-7 text-xs px-2"
                    onClick={() => deletePost.mutate(post.id)}
                    disabled={deletePost.isPending}
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
