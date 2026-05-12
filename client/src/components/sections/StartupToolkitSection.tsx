import { useState } from "react";
import { Wrench, CheckSquare, Square, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

const toolkitCategories = [
  {
    category: "Digital Presence",
    color: "text-galactic-orange",
    icon: "🌐",
    items: [
      { id: "d1", text: "Professional website with mobile-first design", tip: "First impressions happen in 3 seconds. TOBSEYTECH builds conversion-optimised sites." },
      { id: "d2", text: "Google Business Profile verified & optimised", tip: "70% of customers check Google before visiting a business. Don't miss this free traffic." },
      { id: "d3", text: "Consistent branding across all touchpoints", tip: "Consistent branding increases revenue by 23%. Get a brand kit from TOBSEYTECH." },
      { id: "d4", text: "SSL certificate & fast hosting (<2s load)", tip: "1-second delay in load time = 7% drop in conversions." },
    ],
  },
  {
    category: "Automation & AI",
    color: "text-neon-cyan",
    icon: "🤖",
    items: [
      { id: "a1", text: "Lead capture form with automated follow-up", tip: "Speed-to-lead within 5 minutes increases conversion by 9x." },
      { id: "a2", text: "WhatsApp/email auto-responder active", tip: "80% of customer queries can be automated with TOBSEYTECH's AI responder." },
      { id: "a3", text: "CRM connected to all lead sources", tip: "Businesses using CRM see 29% increase in sales." },
      { id: "a4", text: "Weekly automated analytics report", tip: "What gets measured gets managed. Automate your KPI tracking." },
    ],
  },
  {
    category: "Content & Growth",
    color: "text-neon-yellow",
    icon: "📣",
    items: [
      { id: "c1", text: "Content calendar planned 4 weeks ahead", tip: "Consistent posting increases organic reach by 3x." },
      { id: "c2", text: "Email list with regular newsletter", tip: "Email ROI averages $42 for every $1 spent." },
      { id: "c3", text: "At least 1 lead magnet (guide, tool, quiz)", tip: "Lead magnets convert 3-5x better than generic sign-up forms." },
      { id: "c4", text: "Case studies / testimonials published", tip: "92% of customers read reviews before buying." },
    ],
  },
  {
    category: "Security & Compliance",
    color: "text-galactic-green",
    icon: "🔒",
    items: [
      { id: "s1", text: "Two-factor authentication on all accounts", tip: "2FA blocks 99.9% of automated attacks." },
      { id: "s2", text: "Regular data backups (weekly minimum)", tip: "60% of businesses that lose data shut down within 6 months." },
      { id: "s3", text: "Privacy policy & cookie consent in place", tip: "GDPR non-compliance can cost up to €20M or 4% of global turnover." },
      { id: "s4", text: "Team cybersecurity training completed", tip: "95% of breaches are caused by human error." },
    ],
  },
];

export default function StartupToolkitSection() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openCategory, setOpenCategory] = useState<string | null>("Digital Presence");
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const totalItems = toolkitCategories.flatMap(c => c.items).length;
  const totalChecked = Object.values(checked).filter(Boolean).length;
  const progressPct = Math.round((totalChecked / totalItems) * 100);

  const toggle = (id: string) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <section id="startup-toolkit" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-4">
            <Wrench className="w-4 h-4" /> Feature 10 of 12
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Startup Digital Toolkit
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            The 16-point digital readiness checklist every growing business needs. Tick each box, click for expert tips.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="glass-effect p-5 rounded-2xl border border-galactic-orange/20 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-orbitron text-sm text-white">Digital Readiness Score</span>
              <span className="font-orbitron font-bold text-galactic-orange">{progressPct}%</span>
            </div>
            <div className="h-3 bg-space-dark rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-galactic-orange to-galactic-gold rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 font-orbitron">
              {totalChecked}/{totalItems} items complete
              {progressPct === 100 && " 🎉 You're fully digital-ready!"}
              {progressPct >= 50 && progressPct < 100 && " — You're halfway there, keep going!"}
              {progressPct < 50 && " — TOBSEYTECH can help you close every gap"}
            </p>
          </div>

          {/* Accordion categories */}
          <div className="space-y-4">
            {toolkitCategories.map(cat => {
              const catChecked = cat.items.filter(i => checked[i.id]).length;
              const isOpen = openCategory === cat.category;
              return (
                <div key={cat.category} className="glass-effect rounded-2xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => setOpenCategory(isOpen ? null : cat.category)}
                    className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="text-left">
                        <p className={`font-orbitron font-bold text-sm ${cat.color}`}>{cat.category}</p>
                        <p className="text-gray-500 text-xs">{catChecked}/{cat.items.length} complete</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-space-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-galactic-orange rounded-full transition-all duration-300"
                          style={{ width: `${(catChecked / cat.items.length) * 100}%` }}
                        />
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 space-y-3">
                      {cat.items.map(item => (
                        <div key={item.id}>
                          <div
                            className="flex items-start gap-3 cursor-pointer group"
                            onClick={() => toggle(item.id)}
                          >
                            {checked[item.id] ? (
                              <CheckSquare className="w-5 h-5 text-galactic-green flex-shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5 group-hover:text-gray-400 transition-colors" />
                            )}
                            <span className={`text-sm leading-relaxed transition-colors ${checked[item.id] ? "text-gray-500 line-through" : "text-gray-200 group-hover:text-white"}`}>
                              {item.text}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setActiveTip(activeTip === item.id ? null : item.id); }}
                              className="ml-auto flex-shrink-0"
                            >
                              <Lightbulb className={`w-4 h-4 transition-colors ${activeTip === item.id ? "text-neon-yellow" : "text-gray-600 hover:text-neon-yellow"}`} />
                            </button>
                          </div>
                          {activeTip === item.id && (
                            <div className="ml-8 mt-2 p-3 rounded-lg bg-neon-yellow/5 border border-neon-yellow/20 text-xs text-gray-300 leading-relaxed">
                              💡 {item.tip}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
