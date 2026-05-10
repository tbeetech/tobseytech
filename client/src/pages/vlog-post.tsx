import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Loader2, ArrowLeft, Video, Calendar, Tag, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { VlogPost } from "../../../shared/schema";

function getEmbedSrc(embedUrl: string, platform: string): string | null {
  try {
    const url = new URL(embedUrl);
    if (platform === "YouTube") {
      let videoId = url.searchParams.get("v");
      if (!videoId) {
        // youtu.be/ID or /embed/ID or /shorts/ID
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
  } catch { /* ignore */ }
  return embedUrl;
}

export default function VlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
        </div>
      </div>
    );
  }

  if (isError || !vlog) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 pt-32 text-center">
          <Video className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Video not found</h1>
          <p className="text-gray-400 mb-6">The vlog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/vlog">
            <span className="text-neon-cyan hover:underline cursor-pointer">← Back to Vlog</span>
          </Link>
        </div>
      </div>
    );
  }

  const embedSrc = getEmbedSrc(vlog.embedUrl, vlog.embedPlatform);
  const relatedVlogs = related.filter((v) => v.id !== vlog.id && v.category === vlog.category).slice(0, 3);

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back link */}
        <Link href="/vlog">
          <div className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer mb-6 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            Back to Vlog
          </div>
        </Link>

        {/* Meta */}
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-xs text-neon-cyan font-semibold uppercase tracking-wider">{vlog.category}</span>
            <span className="text-gray-700">·</span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(vlog.createdAt), "MMMM d, yyyy")}
            </span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">{vlog.embedPlatform}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-3">{vlog.title}</h1>
          <p className="text-gray-300 text-base leading-relaxed">{vlog.description}</p>
        </div>

        {/* Embedded video player */}
        <div className="rounded-xl overflow-hidden bg-black border border-gray-700 mb-8 aspect-video">
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
              <Video className="w-12 h-12 text-gray-600" />
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

        {/* Tags */}
        {vlog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {vlog.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related vlogs */}
        {relatedVlogs.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">More in {vlog.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedVlogs.map((rv) => (
                <Link key={rv.id} href={`/vlog/${rv.slug}`}>
                  <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-neon-cyan/40 transition-all cursor-pointer group">
                    <div className="aspect-video bg-gray-800 relative">
                      {rv.thumbnail ? (
                        <img src={rv.thumbnail} alt={rv.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-8 h-8 text-gray-700" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-white line-clamp-2 group-hover:text-neon-cyan transition-colors">{rv.title}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{format(new Date(rv.createdAt), "MMM d, yyyy")}</p>
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
