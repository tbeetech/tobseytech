import { useState } from "react";
import { BookOpen, Download, FileText, Video, BarChart2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const resources = [
  {
    id: 1,
    icon: FileText,
    title: "The African Startup Automation Bible",
    description: "A 40-page guide on automating your first 5 business workflows with free and low-cost tools.",
    category: "E-Book",
    downloads: "2.1K",
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    tag: "Most Downloaded",
  },
  {
    id: 2,
    icon: BarChart2,
    title: "Digital Maturity Assessment Template",
    description: "A ready-to-use Excel/Google Sheets template to score your business's current digital capabilities.",
    category: "Template",
    downloads: "1.4K",
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    tag: null,
  },
  {
    id: 3,
    icon: Code2,
    title: "AI Prompt Playbook for SMEs",
    description: "50 battle-tested prompts for marketing, HR, sales, support, and operations — copy, paste, profit.",
    category: "Cheat Sheet",
    downloads: "3.7K",
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    tag: "Free",
  },
  {
    id: 4,
    icon: Video,
    title: "Crash Course: Build Your First Chatbot",
    description: "A 45-minute video walkthrough on building a WhatsApp AI responder using Manychat + GPT.",
    category: "Video",
    downloads: "980",
    color: "text-neon-purple",
    border: "border-neon-purple",
    tag: null,
  },
  {
    id: 5,
    icon: FileText,
    title: "Investor Pitch Deck Framework",
    description: "A 12-slide pitch deck structure used by funded African tech startups — editable Canva template.",
    category: "Template",
    downloads: "1.8K",
    color: "text-galactic-green",
    border: "border-galactic-green",
    tag: "Investor Ready",
  },
  {
    id: 6,
    icon: BookOpen,
    title: "TOBSEYTECH Platform Onboarding Guide",
    description: "Step-by-step guide to getting the maximum value from every feature on the platform.",
    category: "Guide",
    downloads: "760",
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    tag: null,
  },
];

const categories = ["All", "E-Book", "Template", "Cheat Sheet", "Video", "Guide"];

export default function ResourceLibrarySection() {
  const [filter, setFilter] = useState("All");
  const [downloaded, setDownloaded] = useState<number[]>([]);

  const filtered = filter === "All" ? resources : resources.filter(r => r.category === filter);

  const handleDownload = (id: number) => {
    setDownloaded(prev => [...prev, id]);
  };

  return (
    <section id="resources" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-green/30 text-galactic-green text-sm font-orbitron mb-4">
            <BookOpen className="w-4 h-4" /> Feature 7 of 16
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Free Resource Library
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Practical guides, templates, and courses — completely free. Because education is the foundation of transformation.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full border font-orbitron text-xs transition-all ${
                filter === cat
                  ? "border-galactic-orange bg-galactic-orange/20 text-galactic-orange"
                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filtered.map((resource) => {
            const Icon = resource.icon;
            const isDone = downloaded.includes(resource.id);
            return (
              <div
                key={resource.id}
                className={`glass-effect p-6 rounded-2xl border ${resource.border}/20 hover:${resource.border}/40 transition-all group relative`}
              >
                {resource.tag && (
                  <span className={`absolute top-4 right-4 text-xs font-orbitron px-2 py-0.5 rounded-full border ${resource.border}/30 ${resource.color} bg-transparent`}>
                    {resource.tag}
                  </span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${resource.border}/20`}>
                  <Icon className={`w-5 h-5 ${resource.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-orbitron px-2 py-0.5 rounded-full border ${resource.border}/20 ${resource.color}`}>
                    {resource.category}
                  </span>
                  <span className="text-xs text-gray-500 font-orbitron">{resource.downloads} downloads</span>
                </div>
                <h3 className="font-orbitron font-bold text-sm text-white mb-2 leading-snug">{resource.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">{resource.description}</p>
                <Button
                  onClick={() => handleDownload(resource.id)}
                  className={`w-full font-orbitron text-xs transition-all ${
                    isDone
                      ? "bg-galactic-green/20 text-galactic-green border border-galactic-green/30"
                      : `bg-gradient-to-r from-galactic-orange/15 to-galactic-gold/15 text-white hover:from-galactic-orange/30 hover:to-galactic-gold/30 border ${resource.border}/20`
                  }`}
                >
                  {isDone ? "✓ Downloaded" : <><Download className="w-3.5 h-3.5 mr-1" /> Free Download</>}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
