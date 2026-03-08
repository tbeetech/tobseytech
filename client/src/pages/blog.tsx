import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, PenLine, Calendar, Tag, User } from "lucide-react";
import Navigation from "@/components/Navigation";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[];
  category: string;
  published: boolean;
  authorName: string;
  createdAt: string;
}

export default function BlogPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const endpoint = user?.role === "admin" ? "/api/blog/all" : "/api/blog";

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: [endpoint],
    queryFn: async () => {
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load posts");
      return res.json();
    },
  });

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const filtered = posts.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />

      <div className="container mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-orbitron font-bold gradient-text mb-4">
            Tech Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Insights, tutorials, and deep dives into the technology shaping our future.
          </p>
          {user && (
            <Link href="/blog/new">
              <Button className="mt-6 bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
                <PenLine className="w-4 h-4 mr-2" />
                Write a Post
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={
                selectedCategory === null
                  ? "bg-galactic-orange text-space-black font-orbitron"
                  : "border-galactic-orange/40 text-galactic-orange font-orbitron hover:bg-galactic-orange/10"
              }
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? "bg-galactic-orange text-space-black font-orbitron"
                    : "border-galactic-orange/40 text-galactic-orange font-orbitron hover:bg-galactic-orange/10"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No posts found.</p>
            {user && (
              <Link href="/blog/new">
                <Button className="mt-4 bg-galactic-orange text-space-black font-orbitron">
                  Write the first post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <article className="glass-effect rounded-xl overflow-hidden group cursor-pointer hover:border-galactic-orange/40 transition-all duration-300 h-full flex flex-col">
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  {!post.coverImage && (
                    <div className="aspect-video bg-gradient-to-br from-galactic-orange/20 to-galactic-gold/10 flex items-center justify-center">
                      <span className="text-4xl font-orbitron text-galactic-orange/40">TST</span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-galactic-orange/20 text-galactic-orange border-galactic-orange/30 text-xs font-orbitron">
                        {post.category}
                      </Badge>
                      {user && !post.published && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-orbitron font-bold text-white mb-2 group-hover:text-galactic-orange transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="flex items-center gap-0.5 text-xs text-galactic-gold/70">
                            <Tag className="w-2.5 h-2.5" />{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
