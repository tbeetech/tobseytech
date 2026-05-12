import { useRef, useEffect, useState } from "react";
import { Handshake, ExternalLink } from "lucide-react";

const partners = [
  { name: "OpenAI", category: "AI Partner", logo: "🤖", impact: "Powers our AI chat & content tools", color: "text-galactic-green" },
  { name: "Google Cloud", category: "Infrastructure", logo: "☁️", impact: "Scalable hosting for 99.9% uptime", color: "text-neon-cyan" },
  { name: "Manychat", category: "Automation", logo: "💬", impact: "WhatsApp & Messenger automation", color: "text-neon-yellow" },
  { name: "HubSpot", category: "CRM Partner", logo: "📊", impact: "Enterprise CRM integration pipeline", color: "text-galactic-orange" },
  { name: "Stripe", category: "Payments", logo: "💳", impact: "Secure global payment processing", color: "text-neon-purple" },
  { name: "Canva", category: "Design", logo: "🎨", impact: "Brand kit & content creation", color: "text-galactic-red" },
  { name: "Notion", category: "Productivity", logo: "📝", impact: "Client onboarding & project wikis", color: "text-galactic-gold" },
  { name: "Zapier", category: "Integration", logo: "⚡", impact: "3000+ app integrations for clients", color: "text-galactic-green" },
];

const impactStats = [
  { value: "8+", label: "Technology Partners" },
  { value: "3000+", label: "Integrations Available" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "$0", label: "Setup Fees for Partners" },
];

export default function PartnerShowcaseSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="partners" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6" ref={ref}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-4">
            <Handshake className="w-4 h-4" /> Feature 12 of 12
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Partner Network
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We don't build in isolation. Our ecosystem of world-class technology partners means you get enterprise-grade tools at startup-friendly prices.
          </p>
        </div>

        {/* Partner grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
          {partners.map((partner, i) => (
            <div
              key={partner.name}
              onMouseEnter={() => setHovered(partner.name)}
              onMouseLeave={() => setHovered(null)}
              className={`glass-effect p-5 rounded-2xl border border-white/10 hover:border-galactic-orange/40 transition-all duration-300 cursor-pointer text-center group ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="text-4xl mb-3">{partner.logo}</div>
              <p className="font-orbitron font-bold text-sm text-white">{partner.name}</p>
              <p className={`font-orbitron text-xs ${partner.color} mb-2`}>{partner.category}</p>
              {hovered === partner.name && (
                <p className="text-gray-400 text-xs leading-relaxed">{partner.impact}</p>
              )}
            </div>
          ))}
        </div>

        {/* Impact stats */}
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactStats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`text-center p-4 rounded-xl border border-galactic-orange/20 glass-effect transition-all duration-500 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 100 + 400}ms` }}
            >
              <div className="font-orbitron font-black text-2xl gradient-text">{value}</div>
              <p className="text-gray-400 text-xs font-orbitron mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/contact" className="inline-flex items-center gap-2 text-galactic-orange hover:text-galactic-gold font-orbitron text-sm transition-colors">
            Become a Technology Partner <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
