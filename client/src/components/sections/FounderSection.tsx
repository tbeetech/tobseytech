import { Linkedin, Globe, Code2, Brain, Shield, TrendingUp } from "lucide-react";

const expertise = [
  { icon: Code2, label: "Full-Stack Engineering", detail: "React, Node.js, TypeScript, APIs" },
  { icon: Brain, label: "AI & Automation", detail: "NLP, RAG systems, workflow pipelines" },
  { icon: Shield, label: "Cybersecurity", detail: "Threat analysis, secure architecture" },
  { icon: TrendingUp, label: "Digital Strategy", detail: "Go-to-market, growth, KPIs" },
];

const teamRoles = [
  { role: "Founder & Lead Engineer", name: "Oyebade Tobi", note: "Strategy, architecture, product" },
  { role: "Creative & Content Lead", name: "TOBSEYTECH Team", note: "Design, copywriting, media" },
  { role: "AI / Automation Engineer", name: "TOBSEYTECH Team", note: "Pipelines, bots, integrations" },
  { role: "Client Success", name: "TOBSEYTECH Team", note: "Delivery, QA, post-launch support" },
];

export default function FounderSection() {
  return (
    <section id="team" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Meet the Team
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Strategy, design and engineering under one roof — founder-level attention on every project.
          </p>
        </div>

        {/* Founder card */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="glass-effect p-8 rounded-2xl border border-galactic-orange/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center shrink-0">
                <span className="font-orbitron font-black text-space-black text-2xl">OT</span>
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-xl gradient-text">Oyebade Tobi</h3>
                <p className="text-galactic-gold text-sm font-orbitron">Founder & Lead Engineer</p>
                <p className="text-gray-400 text-xs mt-1">TOBSEYTECH · Kingdom Enhancement Corp</p>
              </div>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">
              Digital engineer and automation specialist with deep experience in AI integration,
              full-stack development, cybersecurity, and digital strategy. Based in Nigeria and
              building practical technology solutions for African businesses and beyond.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Oyebade leads TOBSEYTECH as Phase 1 of Kingdom Enhancement Corp — a long-term mission to
              build resilient, profitable tech ventures that fund Kingdom-aligned innovation across Africa.
            </p>

            <a
              href="https://www.linkedin.com/in/oyebade-tobi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-700/20 border border-blue-500/40 rounded-lg text-blue-400 hover:bg-blue-700/40 transition-colors font-orbitron text-sm"
              data-testid="founder-linkedin-link"
            >
              <Linkedin className="w-4 h-4" />
              Connect on LinkedIn
            </a>
          </div>

          {/* Expertise grid */}
          <div className="grid grid-cols-2 gap-4">
            {expertise.map(({ icon: Icon, label, detail }) => (
              <div
                key={label}
                className="card text-center p-5 hover:border-galactic-orange/50 transition-colors"
              >
                <div className="mx-auto mb-3 w-10 h-10 flex items-center justify-center rounded-full bg-galactic-orange/20">
                  <Icon className="w-5 h-5 text-galactic-orange" />
                </div>
                <h4 className="font-orbitron text-sm font-bold text-neon-yellow mb-1">{label}</h4>
                <p className="text-gray-400 text-xs">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team roles */}
        <div>
          <h3 className="font-orbitron font-bold text-2xl text-center mb-8 gradient-text">Our Team Structure</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamRoles.map(({ role, name, note }) => (
              <div key={role} className="glass-effect p-5 rounded-xl border border-galactic-gold/20 text-center hover:border-galactic-gold/50 transition-colors">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-br from-galactic-orange/30 to-galactic-gold/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-galactic-gold" />
                </div>
                <p className="font-orbitron text-xs text-galactic-gold mb-1">{role}</p>
                <p className="text-white text-sm font-semibold mb-1">{name}</p>
                <p className="text-gray-400 text-xs">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
