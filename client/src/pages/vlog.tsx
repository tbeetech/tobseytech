import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Loader2, Video, Search, Calendar, Tag, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import type { VlogPost } from "../../../shared/schema";

export default function VlogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: vlogs = [], isLoading } = useQuery<VlogPost[]>({
    queryKey: ["/api/vlog"],
    queryFn: async () => {
      const res = await fetch("/api/vlog");
      if (!res.ok) throw new Error("Failed to load vlogs");
      return res.json();
    },
  });

  const categories = Array.from(new Set(vlogs.map((v) => v.category)));

  const filtered = vlogs.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.tags.some((t) => t.toLowerCase().includes(q));
    const matchCat = !selectedCategory || v.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const featured = filtered[0] as VlogPost | undefined;
  const rest = filtered.slice(1);

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-neon-cyan" />
            <span className="text-xs uppercase tracking-widest text-neon-cyan font-semibold">ARCOLYTE TECHNOLOGIES Vlog</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Video Hub</h1>
          <p className="text-gray-400 text-base">Curated videos, tutorials, and insights from across the tech world.</p>
        </div>

        {/* Search & filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vlogsâ€¦"
              className="pl-9 bg-gray-900 border-gray-700 text-white"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !selectedCategory ? "bg-neon-cyan text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat ? "bg-neon-cyan text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Video className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No videos found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or check back soon.</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link href={`/vlog/${featured.slug}`}>
                <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-neon-cyan/40 transition-all cursor-pointer mb-8 group">
                  <div className="aspect-video relative bg-gray-800">
                    {featured.thumbnail ? (
                      <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase bg-neon-cyan text-black rounded">Featured</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 text-[10px] bg-black/70 text-white rounded">{featured.embedPlatform}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs text-neon-cyan font-medium">{featured.category}</span>
                      <span className="text-gray-600">Â·</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(featured.createdAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">{featured.title}</h2>
                    <p className="text-gray-400 text-sm line-clamp-2">{featured.description}</p>
                    {featured.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {featured.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="flex items-center gap-1 text-[11px] text-gray-500">
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((vlog) => (
                  <Link key={vlog.id} href={`/vlog/${vlog.slug}`}>
                    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-neon-cyan/40 transition-all cursor-pointer group h-full flex flex-col">
                      <div className="aspect-video relative bg-gray-800">
                        {vlog.thumbnail ? (
                          <img src={vlog.thumbnail} alt={vlog.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="w-10 h-10 text-gray-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-4 h-4 text-black ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-1.5 py-0.5 text-[9px] bg-black/70 text-white rounded">{vlog.embedPlatform}</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <span className="text-[10px] text-neon-cyan font-medium mb-1">{vlog.category}</span>
                        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-neon-cyan transition-colors flex-1">{vlog.title}</h3>
                        <p className="text-xs text-gray-500">{format(new Date(vlog.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
