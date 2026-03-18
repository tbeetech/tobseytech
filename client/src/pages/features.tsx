import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Calculator, Rocket, Brain, Activity, GraduationCap, Trophy,
  BookOpen, TrendingUp, ArrowRight, Wrench, Award, Handshake,
  UserCheck, Play, Globe2, Layers
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: Calculator,
    title: "ROI Calculator",
    description: "Interactive financial model that calculates your exact business ROI from TOBSEYTECH services in real time.",
    tags: ["Interactive", "Finance", "Analytics"],
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    anchor: "/#roi-calculator",
    isPage: false,
  },
  {
    number: "02",
    icon: Rocket,
    title: "Innovation Roadmap",
    description: "Animated milestone timeline showing TOBSEYTECH's journey from startup to Series A and beyond.",
    tags: ["Visual", "Strategy", "Investor"],
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    anchor: "/#roadmap",
    isPage: false,
  },
  {
    number: "03",
    icon: Brain,
    title: "Digital Skills Assessment",
    description: "4-question quiz that benchmarks your business's digital maturity and delivers a personalised roadmap.",
    tags: ["Interactive", "Education", "Quiz"],
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    anchor: "/#skills-quiz",
    isPage: false,
  },
  {
    number: "04",
    icon: Activity,
    title: "Tech Trends Radar",
    description: "Live technology adoption radar showing where AI, automation, cloud, and cybersecurity are heading.",
    tags: ["Visual", "Data", "Research"],
    color: "text-neon-purple",
    border: "border-neon-purple",
    anchor: "/#tech-trends",
    isPage: false,
  },
  {
    number: "05",
    icon: GraduationCap,
    title: "Learning Path Recommender",
    description: "3-step quiz that curates a personalised curriculum of courses and services based on your exact goals.",
    tags: ["Education", "Personalized", "AI"],
    color: "text-galactic-green",
    border: "border-galactic-green",
    anchor: "/learning-path",
    isPage: true,
  },
  {
    number: "06",
    icon: Trophy,
    title: "Community Challenges",
    description: "Monthly competitive challenges where members build real skills, win prizes, and get recognised.",
    tags: ["Community", "Gamification", "Skills"],
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    anchor: "/#challenges",
    isPage: false,
  },
  {
    number: "07",
    icon: BookOpen,
    title: "Free Resource Library",
    description: "Curated e-books, templates, cheat sheets, and video guides — all free, all actionable.",
    tags: ["Education", "Free", "Resources"],
    color: "text-galactic-green",
    border: "border-galactic-green",
    anchor: "/#resources",
    isPage: false,
  },
  {
    number: "08",
    icon: TrendingUp,
    title: "Investor KPI Dashboard",
    description: "Transparent platform metrics updated in real time — proving traction to investors with live data.",
    tags: ["Investor", "Analytics", "Metrics"],
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    anchor: "/#investor-metrics",
    isPage: false,
  },
  {
    number: "09",
    icon: ArrowRight,
    title: "Service Comparison",
    description: "Interactive 3-tier comparison table helping prospects choose the right service package instantly.",
    tags: ["Interactive", "Sales", "Pricing"],
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    anchor: "/#service-comparison",
    isPage: false,
  },
  {
    number: "10",
    icon: Wrench,
    title: "Startup Digital Toolkit",
    description: "16-point interactive checklist every growing business needs, with expert tips for each item.",
    tags: ["Interactive", "Startup", "Education"],
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    anchor: "/#startup-toolkit",
    isPage: false,
  },
  {
    number: "11",
    icon: Award,
    title: "Achievement Badges",
    description: "Gamification system rewarding community participation — from first post to mentorship completion.",
    tags: ["Gamification", "Community", "Rewards"],
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    anchor: "/profile",
    isPage: true,
  },
  {
    number: "12",
    icon: Handshake,
    title: "Partner Network",
    description: "Interactive showcase of TOBSEYTECH's technology partner ecosystem with hover-reveal insights.",
    tags: ["Network", "Partners", "Ecosystem"],
    color: "text-galactic-green",
    border: "border-galactic-green",
    anchor: "/#partners",
    isPage: false,
  },
  {
    number: "13",
    icon: UserCheck,
    title: "Mentorship Network",
    description: "Connect with experienced digital practitioners for 1:1 sessions — apply to mentor or be mentored.",
    tags: ["Mentorship", "Community", "1:1"],
    color: "text-neon-purple",
    border: "border-neon-purple",
    anchor: "/#mentorship",
    isPage: false,
  },
  {
    number: "14",
    icon: Play,
    title: "Live Platform Demo",
    description: "Interactive preview of automation workflows, AI chat, analytics dashboard, and platform features.",
    tags: ["Interactive", "Demo", "Showcase"],
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    anchor: "/#live-demo",
    isPage: false,
  },
  {
    number: "15",
    icon: Globe2,
    title: "Global Impact Map",
    description: "Animated world map showing TOBSEYTECH's client footprint across 14+ countries on 5 continents.",
    tags: ["Visual", "Global", "Impact"],
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    anchor: "/#global-impact",
    isPage: false,
  },
  {
    number: "16",
    icon: Layers,
    title: "Features Hub",
    description: "This page — a unified, filterable showcase of all platform features for investors and prospects.",
    tags: ["Showcase", "Overview", "Investor"],
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    anchor: "/features",
    isPage: true,
  },
  {
    number: "17",
    icon: GraduationCap,
    title: "Career Intelligence Hub",
    description: "Live job listings, curated courses, industry expert recommender, job site guide, and career strategy cheat codes — all in one place.",
    tags: ["Career", "Jobs", "Education", "AI"],
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    anchor: "/career-hub",
    isPage: true,
  },
];

const allTags = ["All", ...Array.from(new Set(features.flatMap(f => f.tags)))];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>17 Interactive Features – TOBSEYTECH</title>
      <Navigation />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <div className="container mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-6">
            <Layers className="w-4 h-4" /> Platform Features
          </div>
          <h1 className="font-orbitron font-bold text-4xl md:text-6xl gradient-text mb-6">
            17 Investor-Ready Features
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed mb-8">
            TOBSEYTECH isn't just a service agency — it's an interactive digital ecosystem. Every feature below is live, built, and designed to attract users, retain community, and demonstrate platform value to investors.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {[
              { label: "Interactive Features", value: "17" },
              { label: "Live Today", value: "17/17" },
              { label: "User-Facing", value: "✓" },
              { label: "Investor-Ready", value: "✓" },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 glass-effect rounded-xl border border-galactic-orange/20">
                <div className="font-orbitron font-bold text-galactic-orange text-xl">{value}</div>
                <div className="text-gray-400 text-xs font-orbitron">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid */}
        <div className="container mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.number}
                  className={`glass-effect p-6 rounded-2xl border ${feature.border}/20 hover:${feature.border}/40 transition-all group relative flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl border ${feature.border}/30 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <span className={`font-orbitron font-black text-2xl ${feature.color} opacity-20`}>{feature.number}</span>
                  </div>

                  <h3 className={`font-orbitron font-bold text-sm ${feature.color} mb-2`}>{feature.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed mb-3 flex-1">{feature.description}</p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {feature.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 font-orbitron">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {feature.isPage ? (
                    <Link href={feature.anchor}>
                      <Button
                        size="sm"
                        className={`w-full font-orbitron text-xs bg-gradient-to-r from-galactic-orange/20 to-galactic-gold/20 text-white hover:from-galactic-orange/40 hover:to-galactic-gold/40 border ${feature.border}/20`}
                      >
                        Open Feature <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  ) : (
                    <a href={feature.anchor}>
                      <Button
                        size="sm"
                        className={`w-full font-orbitron text-xs bg-gradient-to-r from-galactic-orange/20 to-galactic-gold/20 text-white hover:from-galactic-orange/40 hover:to-galactic-gold/40 border ${feature.border}/20`}
                      >
                        See Feature <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="container mx-auto px-6 mt-16 text-center">
          <div className="glass-effect max-w-3xl mx-auto p-10 rounded-3xl border border-galactic-orange/30">
            <h2 className="font-orbitron font-bold text-3xl gradient-text mb-4">
              Ready to Invest or Partner?
            </h2>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              TOBSEYTECH is raising investment to scale these features globally. Book a call with the founder or request the full investor deck.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold">
                  Request Investor Deck
                </Button>
              </Link>
              <Link href="/book-demo">
                <Button size="lg" variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron">
                  Book a Platform Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
