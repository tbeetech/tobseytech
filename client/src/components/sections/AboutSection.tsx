import { CheckCircle2, Target, Zap, Users, Handshake } from "lucide-react";

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

// Partner logos as inline SVGs / simple wordmark icons
const partners = [
  {
    name: "OpenAI",
    category: "AI Partner",
    color: "text-galactic-green",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="OpenAI">
        <path d="M22.28 9.81a5.77 5.77 0 0 0-.49-4.73 5.85 5.85 0 0 0-6.29-2.8A5.77 5.77 0 0 0 11.17 1a5.85 5.85 0 0 0-5.58 4.05 5.77 5.77 0 0 0-3.85 2.8 5.85 5.85 0 0 0 .72 6.86 5.77 5.77 0 0 0 .49 4.73 5.85 5.85 0 0 0 6.29 2.8A5.77 5.77 0 0 0 12.83 23a5.85 5.85 0 0 0 5.59-4.05 5.77 5.77 0 0 0 3.85-2.8 5.85 5.85 0 0 0-.72-6.86zM12.83 21.5a4.33 4.33 0 0 1-2.78-1 .07.07 0 0 1 0-.06l6.96-4.02a.42.42 0 0 0 .21-.37V10.4l2.94 1.7v.07a4.38 4.38 0 0 1-7.33 9.33zm-9.31-4a4.33 4.33 0 0 1-.52-2.91.07.07 0 0 1 .05 0l6.97 4.02a.42.42 0 0 0 .42 0l8.5-4.91v3.4a.07.07 0 0 1-.03.06L12 21.17a4.38 4.38 0 0 1-8.48-3.66zm-1.2-9.54a4.34 4.34 0 0 1 2.27-1.91v8.28a.42.42 0 0 0 .21.37l8.5 4.9-2.94 1.7a.07.07 0 0 1-.06 0L3.57 16.9a4.38 4.38 0 0 1-.25-8.94zM19.5 12.76l-8.5-4.9 2.94-1.7a.07.07 0 0 1 .06 0l6.74 3.89a4.38 4.38 0 0 1-.68 7.9v-8.27a.42.42 0 0 0-.22-.37zm2.92-3.08a.07.07 0 0 1-.05 0L15.4 5.66a.42.42 0 0 0-.42 0L6.48 10.57V7.17a.07.07 0 0 1 .03-.06L13.24 3a4.38 4.38 0 0 1 9.18 6.68zm-18.4 5.4-2.94-1.7a.07.07 0 0 1-.03-.06V6.91a4.38 4.38 0 0 1 7.19-3.36.07.07 0 0 1 0 .06L1.24 7.63a.42.42 0 0 0-.21.37zm3.17-1.72 3.78-2.18 3.78 2.18v4.35L11 20.08 7.19 17.7z"/>
      </svg>
    ),
  },
  {
    name: "Google Cloud",
    category: "Infrastructure",
    color: "text-neon-cyan",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="Google Cloud">
        <path d="M12.19 2.38a9.344 9.344 0 0 0-9.234 6.893c.053-.02-.055.013 0 0C1.46 9.713 0 11.33 0 13.27c0 2.363 1.917 4.28 4.28 4.28h15.12c2.308 0 4.28-1.917 4.28-4.28 0-2.308-1.753-4.194-3.998-4.276A9.34 9.34 0 0 0 12.19 2.38zm0 1.498c1.744 0 3.35.597 4.63 1.59L10.95 11.34a.749.749 0 0 0-.016 1.059l.007.007.006.006.014.014.01.008c.143.13.326.2.517.2a.75.75 0 0 0 .53-.22l5.886-5.877a7.86 7.86 0 0 1 1.918 5.203H4.28a2.784 2.784 0 0 1 0-5.568 2.74 2.74 0 0 1 .744.1l.006.002.007.001c.28.08.585.01.8-.19a.748.748 0 0 0 .19-.813A7.85 7.85 0 0 1 12.19 3.878z"/>
      </svg>
    ),
  },
  {
    name: "Manychat",
    category: "Automation",
    color: "text-neon-yellow",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="Manychat">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-1 13H7v-2h4v2zm6 0h-4v-2h4v2zm0-4H7V9h10v2z"/>
      </svg>
    ),
  },
  {
    name: "HubSpot",
    category: "CRM Partner",
    color: "text-galactic-orange",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="HubSpot">
        <path d="M18.164 7.93V5.084a1.856 1.856 0 0 0 1.071-1.675V3.38A1.856 1.856 0 0 0 17.38 1.52h-.02a1.856 1.856 0 0 0-1.855 1.856v.029a1.856 1.856 0 0 0 1.07 1.675V7.93a5.264 5.264 0 0 0-2.496 1.109L7.4 3.664a2.074 2.074 0 1 0-.881.972l6.584 5.294a5.26 5.26 0 0 0-.718 2.66 5.264 5.264 0 0 0 .718 2.661l-2.014 1.54a1.624 1.624 0 1 0 .869.99l2.162-1.654a5.264 5.264 0 0 0 7.58-4.697 5.26 5.26 0 0 0-3.536-4.499zm-1.32 7.29a2.81 2.81 0 1 1 0-5.618 2.81 2.81 0 0 1 0 5.619z"/>
      </svg>
    ),
  },
  {
    name: "Stripe",
    category: "Payments",
    color: "text-neon-purple",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="Stripe">
        <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.612.569-1.019 1.503-1.019a9.53 9.53 0 0 1 4.026 1.092l.588-3.634a12.56 12.56 0 0 0-4.617-.875c-1.568 0-2.882.388-3.854 1.126C7.561 5.562 6.98 6.708 6.98 8.065c0 2.41 1.426 3.552 4.183 4.567 1.635.614 2.42 1.107 2.42 1.843 0 .7-.637 1.106-1.69 1.106a10.35 10.35 0 0 1-4.604-1.265l-.567 3.618a13.26 13.26 0 0 0 5.164 1.056c1.602 0 3.01-.378 4.003-1.126C17.007 17.105 17.6 15.9 17.6 14.469c0-2.462-1.454-3.631-4.121-4.586z"/>
      </svg>
    ),
  },
  {
    name: "Zapier",
    category: "Integration",
    color: "text-galactic-orange",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="Zapier">
        <path d="M12.003 0C5.373 0 0 5.373 0 12.003c0 6.628 5.373 12.001 12.003 12.001 6.628 0 12.001-5.373 12.001-12.001C24.004 5.373 18.631 0 12.003 0zm5.476 14.036l-2.46.002.003 2.459a.998.998 0 0 1-1 1 .997.997 0 0 1-.999-1l-.002-2.458H10.56a1 1 0 0 1-.703-1.706l1.742-1.742-1.742-1.743a.999.999 0 0 1 .703-1.705l2.46.002-.002-2.459a1 1 0 0 1 2 0l.002 2.46 2.46-.003a1 1 0 0 1 .705 1.706l-1.742 1.742 1.742 1.742a.997.997 0 0 1-.706 1.703z"/>
      </svg>
    ),
  },
  {
    name: "Notion",
    category: "Productivity",
    color: "text-galactic-gold",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="Notion">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.047.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
      </svg>
    ),
  },
  {
    name: "Canva",
    category: "Design",
    color: "text-galactic-green",
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="currentColor" aria-label="Canva">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.807 15.186a3.4 3.4 0 0 1-2.695 1.326 3.407 3.407 0 0 1-3.404-3.404c0-.893.347-1.739.977-2.38a.348.348 0 0 0-.076-.543L9.2 9.5a.35.35 0 0 0-.476.118 5.246 5.246 0 0 0-.802 2.793 5.27 5.27 0 0 0 5.265 5.265 5.26 5.26 0 0 0 4.173-2.062.348.348 0 0 0-.059-.488l-1.38-1.038a.348.348 0 0 0-.114.098zm.637-7.34a2.07 2.07 0 1 1 0 4.14 2.07 2.07 0 0 1 0-4.14z"/>
      </svg>
    ),
  },
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
        <div className="mb-16 sm:mb-20">
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

        {/* Partner Network */}
        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-3">
              <Handshake className="w-4 h-4" /> Partner Network
            </div>
            <h3 className="font-orbitron font-bold text-2xl gradient-text mb-2">Our Technology Partners</h3>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              We don't build in isolation. Our ecosystem of world-class technology partners means you get enterprise-grade tools at startup-friendly prices.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="glass-effect p-5 rounded-2xl border border-white/10 hover:border-galactic-orange/40 transition-all cursor-default text-center group"
              >
                <div className={`flex justify-center mb-3 ${partner.color}`}>
                  {partner.icon}
                </div>
                <p className="font-orbitron font-bold text-sm text-white">{partner.name}</p>
                <p className={`font-orbitron text-xs ${partner.color} mt-0.5`}>{partner.category}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

