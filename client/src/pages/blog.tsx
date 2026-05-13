import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, PenLine, Calendar, Tag, User, ArrowRight } from "lucide-react";
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
  authorId: string;
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

  // featured is undefined when filtered is empty; the empty-state branch renders first
  const featured = filtered[0] as BlogPost | undefined;
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />

      {/* Hero header */}
      <div
        className="pt-28 pb-14 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,197,94,0.10) 0%, transparent 65%), var(--space-black)",
        }}
      >
        <div className="absolute inset-0 starfield opacity-20 pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <p className="text-galactic-orange font-tech text-sm tracking-widest uppercase mb-3 animate-fade-in">
            // Knowledge Base
          </p>
          <h1 className="text-5xl md:text-6xl font-orbitron font-black gradient-text mb-4 animate-slide-up">
            Tech Blog
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Insights, tutorials, and deep dives into the technology shaping our future.
          </p>
          {user && (
            <Link href="/blog/new">
              <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all">
                <PenLine className="w-4 h-4 mr-2" />
                Write a Post
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 pb-16">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search posts, tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-galactic-orange/20 text-white text-sm focus:border-galactic-orange neon-input"
              style={{ background: "rgba(34,197,94,0.04)" }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`badge-neon transition-all ${
                selectedCategory === null
                  ? "badge-orange"
                  : "border-white/15 text-gray-400 hover:border-galactic-orange/30 hover:text-galactic-orange"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`badge-neon transition-all ${
                  selectedCategory === cat
                    ? "badge-orange"
                    : "border-white/15 text-gray-400 hover:border-galactic-orange/30 hover:text-galactic-orange"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-galactic-orange/10 border border-galactic-orange/20 flex items-center justify-center mx-auto mb-4">
              <PenLine className="w-7 h-7 text-galactic-orange/50" />
            </div>
            <p className="text-gray-400 text-lg mb-2">No posts found.</p>
            <p className="text-gray-600 text-sm mb-6">
              {search ? "Try a different search term." : "Be the first to write something."}
            </p>
            {user && (
              <Link href="/blog/new">
                <Button className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold">
                  Write the first post
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Featured hero post */}
            {featured && !search && !selectedCategory && (
              <Link href={`/blog/${featured.slug}`}>
                <article className="blog-card mb-10 cursor-pointer group md:flex">
                  <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="w-full h-full min-h-[220px] flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(0,212,255,0.08))" }}
                      >
                        <img src="/favicon.svg" alt="TOBSEYTECH" className="w-20 h-20 opacity-60" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-7 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="badge-neon badge-orange">{featured.category}</span>
                      {user && !featured.published && (
                        <span className="badge-neon badge-draft">Draft</span>
                      )}
                      <span className="badge-neon badge-cyan">Featured</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-white mb-3 group-hover:text-galactic-orange transition-colors line-clamp-2">
                      {featured.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3 flex-1">{featured.excerpt}</p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <Link href={`/profile/${featured.authorId}`} onClick={(e) => e.stopPropagation()}>
                          <span className="hover:text-galactic-orange transition-colors">{featured.authorName}</span>
                        </Link>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(featured.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Post grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(search || selectedCategory ? filtered : rest).map((post, i) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article
                    className="blog-card cursor-pointer group h-full flex flex-col animate-card-appear"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="aspect-video overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(0,212,255,0.05))" }}
                        >
                          <img src="/favicon.svg" alt="TOBSEYTECH" className="w-12 h-12 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge-neon badge-orange">{post.category}</span>
                        {user && !post.published && (
                          <span className="badge-neon badge-draft">Draft</span>
                        )}
                      </div>
                      <h2 className="text-base font-orbitron font-bold text-white mb-2 group-hover:text-galactic-orange transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-400 text-sm line-clamp-3 flex-1 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" /> {post.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-0.5 text-xs text-galactic-gold/60"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
