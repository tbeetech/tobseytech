import { useRef, useEffect, useState } from "react";
import { CheckCircle, Zap, Globe, Users, Award, Rocket } from "lucide-react";

const milestones = [
  {
    year: "2022",
    title: "Foundation",
    description: "TOBSEYTECH launched with a vision to democratize digital transformation for African businesses.",
    icon: Rocket,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    bg: "bg-galactic-orange/10",
    status: "done",
  },
  {
    year: "2023",
    title: "Platform Growth",
    description: "Expanded to 8 service verticals; automated 80% of client workflows; 500+ monthly leads organized.",
    icon: Zap,
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    bg: "bg-neon-yellow/10",
    status: "done",
  },
  {
    year: "2024",
    title: "Community Launch",
    description: "Launched blog, user accounts, chat, and courses. Built a thriving tech-learning community.",
    icon: Users,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    bg: "bg-neon-cyan/10",
    status: "done",
  },
  {
    year: "2025 Q1",
    title: "Intelligence Layer",
    description: "Deploying AI-driven ROI tools, skills assessments, mentorship matching, and learning paths.",
    icon: Award,
    color: "text-galactic-green",
    border: "border-galactic-green",
    bg: "bg-galactic-green/10",
    status: "current",
  },
  {
    year: "2025 Q3",
    title: "Investor Readiness",
    description: "Series A fundraise targeting $2M. 30+ enterprise clients, $1M ARR milestone, global expansion.",
    icon: Globe,
    color: "text-neon-purple",
    border: "border-neon-purple",
    bg: "bg-neon-purple/10",
    status: "upcoming",
  },
  {
    year: "2026",
    title: "Global Scale",
    description: "10,000+ community members, presence in 5 continents, IPO-track revenue model.",
    icon: CheckCircle,
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    bg: "bg-galactic-gold/10",
    status: "upcoming",
  },
];

function MilestoneCard({ milestone, index }: { milestone: (typeof milestones)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const Icon = milestone.icon;
  const isLeft = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`flex items-center gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms`, flexDirection: isLeft ? "row" : "row-reverse" }}
    >
      {/* Card */}
      <div className={`flex-1 p-5 rounded-xl border glass-effect ${milestone.border}/20 hover:${milestone.border}/40 transition-colors ${milestone.status === "current" ? "ring-2 ring-galactic-orange/50" : ""}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`font-orbitron text-xs px-2 py-0.5 rounded-full border ${milestone.border}/30 ${milestone.color}`}>
            {milestone.year}
          </span>
          {milestone.status === "current" && (
            <span className="font-orbitron text-xs px-2 py-0.5 rounded-full bg-galactic-orange/20 text-galactic-orange animate-pulse">
              NOW
            </span>
          )}
          {milestone.status === "upcoming" && (
            <span className="font-orbitron text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
              UPCOMING
            </span>
          )}
        </div>
        <h3 className={`font-orbitron font-bold text-base ${milestone.color} mb-1`}>{milestone.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{milestone.description}</p>
      </div>

      {/* Center Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 ${milestone.bg} ${milestone.border}`}>
        <Icon className={`w-5 h-5 ${milestone.color}`} />
      </div>

      {/* Spacer */}
      <div className="flex-1 hidden md:block" />
    </div>
  );
}

export default function InnovationRoadmapSection() {
  return (
    <section id="roadmap" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-4">
            <Rocket className="w-4 h-4" /> Feature 2 of 16
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Innovation Roadmap
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            From startup to scale-up — every milestone mapped, every stage funded by results.
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-galactic-orange via-neon-cyan to-galactic-gold opacity-30 hidden md:block" style={{ transform: "translateX(-50%)" }} />

          <div className="space-y-8">
            {milestones.map((m, i) => (
              <MilestoneCard key={m.year} milestone={m} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
