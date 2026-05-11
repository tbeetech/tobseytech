import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Download,
  Trash2,
  Send,
  Pencil,
  ExternalLink,
  Image as ImageIcon,
  X,
  Plus,
  Rss,
} from "lucide-react";

export interface FetchedPostSuggestion {
  externalId: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  category: string;
  sourceUrl: string;
  author: string;
  source: string;
  publishedAt: string;
  content: string;
}

interface EditState {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  category: string;
  slug: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function PostFetcherTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [topics, setTopics] = useState<string[]>(["javascript", "ai", "webdev"]);
  const [topicInput, setTopicInput] = useState("");
  const [count, setCount] = useState(30);
  const [suggestions, setSuggestions] = useState<FetchedPostSuggestion[]>([]);
  const [discarded, setDiscarded] = useState<Set<string>>(new Set());

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FetchedPostSuggestion | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    tags: "",
    category: "",
    slug: "",
  });

  // Fetch mutation
  const fetchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/fetch-posts", {
        topics,
        count,
      });
      return res.json() as Promise<{ suggestions: FetchedPostSuggestion[]; message?: string }>;
    },
    onSuccess: (data) => {
      setSuggestions(data.suggestions ?? []);
      setDiscarded(new Set());
      if (data.suggestions?.length === 0) {
        toast({ title: "No posts found", description: data.message || "Try different topics.", variant: "destructive" });
      } else {
        toast({ title: `Fetched ${data.suggestions.length} post suggestions!` });
      }
    },
    onError: () => {
      toast({ title: "Fetch failed", description: "Could not retrieve post suggestions. Try again.", variant: "destructive" });
    },
  });

  // Post (publish) mutation
  const postMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      coverImage: string | null;
      tags: string[];
      category: string;
    }) => {
      const res = await apiRequest("POST", "/api/blog", { ...data, published: true });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Post published!" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to publish post", description: err?.message || "An error occurred.", variant: "destructive" });
    },
  });

  const addTopic = () => {
    const t = topicInput.trim().replace(/[^a-z0-9-]/gi, "").toLowerCase();
    if (t && !topics.includes(t) && topics.length < 10) {
      setTopics([...topics, t]);
    }
    setTopicInput("");
  };

  const removeTopic = (t: string) => setTopics(topics.filter((x) => x !== t));

  const openEdit = (suggestion: FetchedPostSuggestion) => {
    setEditTarget(suggestion);
    setSlugManuallyEdited(false);
    setEditState({
      title: suggestion.title,
      excerpt: suggestion.excerpt,
      content: suggestion.content,
      coverImage: suggestion.coverImage ?? "",
      tags: suggestion.tags.join(", "),
      category: suggestion.category,
      slug: slugify(suggestion.title),
    });
    setEditOpen(true);
  };

  const handlePost = (suggestion: FetchedPostSuggestion) => {
    const slug = slugify(suggestion.title) + "-" + suggestion.externalId.slice(-4);
    postMutation.mutate(
      {
        title: suggestion.title,
        slug,
        excerpt: suggestion.excerpt,
        content: suggestion.content,
        coverImage: suggestion.coverImage,
        tags: suggestion.tags,
        category: suggestion.category,
      },
      { onSuccess: () => setDiscarded((prev) => new Set(Array.from(prev).concat(suggestion.externalId))) }
    );
  };

  const handleEditPost = () => {
    if (!editTarget) return;
    const slug = editState.slug || slugify(editState.title) + "-" + editTarget.externalId.slice(-4);
    const tags = editState.tags.split(",").map((t) => t.trim()).filter(Boolean);
    postMutation.mutate(
      {
        title: editState.title,
        slug,
        excerpt: editState.excerpt,
        content: editState.content,
        coverImage: editState.coverImage || null,
        tags,
        category: editState.category,
      },
      {
        onSuccess: () => {
          setDiscarded((prev) => new Set(Array.from(prev).concat(editTarget.externalId)));
          setEditOpen(false);
        },
      }
    );
  };

  const visible = suggestions.filter((s) => !discarded.has(s.externalId));

  return (
    <div className="glass-effect rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center">
          <Rss className="w-5 h-5 text-galactic-orange" />
        </div>
        <div>
          <h2 className="text-lg font-orbitron font-bold text-galactic-orange">
            Post Fetcher &amp; Re-poster
          </h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Fetch the latest tech articles from Dev.to and publish them to TobseyTech
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-space-dark rounded-xl p-5 mb-6 border border-galactic-orange/10">
        {/* Topics */}
        <div className="mb-4">
          <Label className="text-galactic-orange font-orbitron text-xs mb-2 block">
            Topics / Tags
          </Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {topics.map((t) => (
              <Badge
                key={t}
                className="bg-galactic-orange/15 text-galactic-orange border-galactic-orange/30 text-xs flex items-center gap-1 pr-1"
              >
                {t}
                <button
                  onClick={() => removeTopic(t)}
                  className="hover:text-red-400 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTopic(); } }}
              placeholder="Add topic (e.g. typescript, ai, cloud)"
              className="bg-space-black border-galactic-orange/20 text-white text-sm h-9 flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={addTopic}
              disabled={!topicInput.trim()}
              className="text-galactic-orange hover:text-galactic-gold border border-galactic-orange/20 h-9 px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Count + Fetch */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label className="text-galactic-orange font-orbitron text-xs mb-2 block">
              Count (max 30)
            </Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={count}
              onChange={(e) => setCount(Math.min(30, Math.max(1, Number(e.target.value))))}
              className="bg-space-black border-galactic-orange/20 text-white text-sm h-9 w-24"
            />
          </div>
          <Button
            onClick={() => fetchMutation.mutate()}
            disabled={fetchMutation.isPending || topics.length === 0}
            className="h-9 bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all flex-shrink-0"
          >
            {fetchMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching…</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Fetch {count} Posts</>
            )}
          </Button>
          {visible.length > 0 && (
            <span className="text-gray-400 text-xs">
              {visible.length} suggestion{visible.length !== 1 ? "s" : ""} ready
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {fetchMutation.isPending && (
        <div className="flex flex-col items-center justify-center py-16 text-galactic-orange/60 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-orbitron text-sm">Fetching posts from Dev.to…</span>
        </div>
      )}

      {!fetchMutation.isPending && suggestions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-galactic-orange/30 gap-3">
          <Rss className="w-12 h-12" />
          <p className="font-orbitron text-sm text-center">
            Add topics and hit <span className="text-galactic-orange">Fetch</span> to pull the latest tech articles
          </p>
        </div>
      )}

      {!fetchMutation.isPending && visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((suggestion) => (
            <SuggestionCard
              key={suggestion.externalId}
              suggestion={suggestion}
              isPosting={postMutation.isPending}
              onDiscard={() => setDiscarded((prev) => new Set(Array.from(prev).concat(suggestion.externalId)))}
              onEdit={() => openEdit(suggestion)}
              onPost={() => handlePost(suggestion)}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-space-dark border-galactic-orange/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-galactic-orange text-base flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit Before Posting
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-galactic-orange/80 text-xs font-orbitron">Title</Label>
              <Input
                value={editState.title}
                onChange={(e) => setEditState((s) => ({
                  ...s,
                  title: e.target.value,
                  // Only auto-sync the slug when the user hasn't manually edited it
                  slug: slugManuallyEdited ? s.slug : slugify(e.target.value),
                }))}
                className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-galactic-orange/80 text-xs font-orbitron">Slug</Label>
              <Input
                value={editState.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setEditState((s) => ({ ...s, slug: e.target.value }));
                }}
                className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm font-mono"
                placeholder="auto-generated-slug"
              />
            </div>
            <div>
              <Label className="text-galactic-orange/80 text-xs font-orbitron">Excerpt</Label>
              <Textarea
                value={editState.excerpt}
                onChange={(e) => setEditState((s) => ({ ...s, excerpt: e.target.value }))}
                className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm resize-none"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-galactic-orange/80 text-xs font-orbitron">Content (Markdown)</Label>
              <Textarea
                value={editState.content}
                onChange={(e) => setEditState((s) => ({ ...s, content: e.target.value }))}
                className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm resize-y font-mono"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-galactic-orange/80 text-xs font-orbitron">Category</Label>
                <Input
                  value={editState.category}
                  onChange={(e) => setEditState((s) => ({ ...s, category: e.target.value }))}
                  className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm"
                  placeholder="e.g. javascript"
                />
              </div>
              <div>
                <Label className="text-galactic-orange/80 text-xs font-orbitron">Tags (comma separated)</Label>
                <Input
                  value={editState.tags}
                  onChange={(e) => setEditState((s) => ({ ...s, tags: e.target.value }))}
                  className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm"
                  placeholder="e.g. react, node, ai"
                />
              </div>
            </div>
            <div>
              <Label className="text-galactic-orange/80 text-xs font-orbitron">Cover Image URL</Label>
              <Input
                value={editState.coverImage}
                onChange={(e) => setEditState((s) => ({ ...s, coverImage: e.target.value }))}
                className="bg-space-black border-galactic-orange/20 text-white mt-1 text-sm"
                placeholder="https://..."
              />
              {editState.coverImage && (
                <img
                  src={editState.coverImage}
                  alt="Cover preview"
                  className="mt-2 rounded-lg h-28 w-full object-cover border border-galactic-orange/10"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditPost}
              disabled={postMutation.isPending || !editState.title || !editState.excerpt || !editState.content || !editState.category}
              className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold"
            >
              {postMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Publishing…</>
              ) : (
                <><Send className="w-4 h-4 mr-1" /> Publish Post</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: FetchedPostSuggestion;
  isPosting: boolean;
  onDiscard: () => void;
  onEdit: () => void;
  onPost: () => void;
}

function SuggestionCard({ suggestion, isPosting, onDiscard, onEdit, onPost }: SuggestionCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-space-dark rounded-xl border border-galactic-orange/10 overflow-hidden flex flex-col group hover:border-galactic-orange/30 transition-colors">
      {/* Cover Image */}
      <div className="relative h-36 bg-galactic-orange/5 flex-shrink-0">
        {suggestion.coverImage && !imgError ? (
          <img
            src={suggestion.coverImage}
            alt={suggestion.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-galactic-orange/20" />
          </div>
        )}
        {/* Source badge */}
        <span className="absolute top-2 left-2 bg-space-black/70 text-galactic-orange text-[10px] font-orbitron px-2 py-0.5 rounded-full border border-galactic-orange/20">
          {suggestion.source}
        </span>
        {/* External link */}
        <a
          href={suggestion.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 right-2 bg-space-black/70 text-gray-400 hover:text-galactic-gold p-1 rounded-full border border-white/10 transition-colors"
          title="Open original article"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2 mb-1.5 group-hover:text-galactic-gold transition-colors">
          {suggestion.title}
        </p>
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-3 mb-2 flex-1">
          {suggestion.excerpt}
        </p>

        {/* Tags */}
        {suggestion.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {suggestion.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                className="bg-galactic-orange/10 text-galactic-orange/70 border-galactic-orange/20 text-[10px] px-1.5 py-0"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author */}
        <p className="text-gray-500 text-[10px] mb-3 truncate">
          By {suggestion.author}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={onDiscard}
            className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 h-7 px-2 text-xs flex-1"
            title="Discard"
          >
            <Trash2 className="w-3 h-3 mr-1" /> Discard
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onEdit}
            className="text-blue-400/80 hover:text-blue-300 hover:bg-blue-500/10 h-7 px-2 text-xs flex-1"
            title="Edit then post"
          >
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            onClick={onPost}
            disabled={isPosting}
            className="bg-galactic-orange/90 hover:bg-galactic-orange text-space-black h-7 px-2 text-xs flex-1 font-orbitron"
            title="Publish immediately"
          >
            {isPosting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <><Send className="w-3 h-3 mr-1" /> Post</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
