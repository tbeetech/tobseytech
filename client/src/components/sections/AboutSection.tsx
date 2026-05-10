import { CheckCircle2, Target, Zap, Users } from "lucide-react";

const values = [
  {
    icon: Zap,
    title: "Practical First",
    body: "Ship value fast, then iterate. We never let perfect block good.",
  },
  {
    icon: Target,
    title: "Outcome Contracts",
    body: "Clear milestones, transparent pricing, and measurable deliverables every time.",
  },
  {
    icon: Users,
    title: "Founder Attention",
    body: "Founder-level focus on every mission-critical project we take on.",
  },
  {
    icon: CheckCircle2,
    title: "Proof Over Promises",
    body: "We document real results: case studies, metrics, and client outcomes.",
  },
];

const pillars = [
  { label: "Accessibility", desc: "Solutions that any business can use — from solo founders to large teams." },
  { label: "Reliability", desc: "On-time delivery ≥ 95% — milestone-based contracts with QA gates." },
  { label: "Measurable Impact", desc: "Every engagement tied to a KPI: leads, time saved, revenue, or NPS." },
];

const kecPhases = [
  { phase: "Phase 1 (Now)", name: "TOBSEYTECH", desc: "Digital agency: automation, web/app dev, AI, content, marketing." },
  { phase: "Phase 2", name: "KEC Labs", desc: "Product R&D — SaaS tools, templates, and reusable accelerators." },
  { phase: "Phase 3", name: "Kingdom Fund", desc: "Reinvest profits into Kingdom-aligned technology and social impact." },
];

export default function AboutSection() {
  return (
    <section id="about" className="page-section py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Who We Are */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start mb-14 sm:mb-20">
          <div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-6 gradient-text">
              Who We Are
            </h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              TOBSEYTECH is the engineering arm of <span className="text-galactic-gold font-semibold">Kingdom Enhancement Corp (KEC)</span> —
              a digital agency built to deliver automation-first solutions to media houses, SMEs, startups, and social-impact
              organisations across Africa and globally.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Founded by <span className="text-galactic-orange font-semibold">Oyebade Tobi</span>, the team combines strategy,
              design, engineering, and operations under one roof. We close the trust gap in Africa's digital economy with
              clear scopes, reliable timelines, and quality delivery.
            </p>
            <ul className="space-y-3">
              {pillars.map(({ label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span className="mt-1 w-2 h-2 shrink-0 rounded-full bg-galactic-orange animate-pulse" />
                  <span className="text-gray-300 text-sm">
                    <span className="text-neon-yellow font-orbitron font-bold">{label}: </span>
                    {desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, body }) => (
              <div key={title} className="glass-effect p-5 rounded-xl border border-galactic-orange/20 hover:border-galactic-orange/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-galactic-orange/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-galactic-orange" />
                </div>
                <h4 className="font-orbitron text-sm font-bold text-neon-yellow mb-1">{title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* KEC Roadmap */}
        <div>
          <h3 className="font-orbitron font-bold text-2xl text-center mb-8 gradient-text">
            Kingdom Enhancement Corp — Roadmap
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {kecPhases.map(({ phase, name, desc }, i) => (
              <div
                key={phase}
                className={`glass-effect p-6 rounded-xl border text-center transition-colors ${
                  i === 0
                    ? "border-galactic-orange/60 shadow-[0_0_16px_rgba(34,197,94,0.15)]"
                    : "border-galactic-gold/20 opacity-70"
                }`}
              >
                <p className="text-xs text-galactic-gold font-orbitron mb-1">{phase}</p>
                <h4 className="font-orbitron font-bold text-lg gradient-text mb-2">{name}</h4>
                <p className="text-gray-400 text-sm">{desc}</p>
                {i === 0 && (
                  <span className="inline-block mt-3 px-3 py-1 bg-galactic-orange/20 text-galactic-orange rounded-full text-xs font-orbitron">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

