import { useRef, useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, Globe, Zap, Star } from "lucide-react";

function useCountUp(target: number, duration: number, active: boolean, decimals = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const steps = duration / 16;
    const increment = target / steps;
    const timer = setInterval(() => {
      start = Math.min(start + increment, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return decimals > 0 ? count.toFixed(decimals) : Math.round(count);
}

const metrics = [
  {
    icon: Users,
    label: "Active Community Members",
    value: 1240,
    suffix: "+",
    sub: "+18% MoM growth",
    color: "text-galactic-orange",
    border: "border-galactic-orange",
  },
  {
    icon: DollarSign,
    label: "Revenue Pipeline",
    value: 85,
    suffix: "K",
    sub: "Q1 2025 qualified leads",
    color: "text-neon-yellow",
    border: "border-neon-yellow",
  },
  {
    icon: Globe,
    label: "Countries Reached",
    value: 14,
    suffix: "",
    sub: "Active clients & students",
    color: "text-neon-cyan",
    border: "border-neon-cyan",
  },
  {
    icon: Zap,
    label: "Automations Deployed",
    value: 320,
    suffix: "+",
    sub: "Live client workflows",
    color: "text-galactic-green",
    border: "border-galactic-green",
  },
  {
    icon: TrendingUp,
    label: "Client Retention Rate",
    value: 94,
    suffix: "%",
    sub: "12-month rolling average",
    color: "text-neon-purple",
    border: "border-neon-purple",
  },
  {
    icon: Star,
    label: "Average Client Rating",
    value: 4.9,
    suffix: "/5",
    sub: "Across 120+ projects",
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    decimals: 1,
  },
];

function MetricCard({ icon: Icon, label, value, suffix, sub, color, border, decimals = 0 }: (typeof metrics)[0] & { decimals?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, 1600, active, decimals);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`glass-effect p-6 rounded-2xl border ${border}/20 hover:${border}/40 transition-all group text-center`}
    >
      <div className={`w-12 h-12 rounded-full border ${border}/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className={`font-orbitron font-black text-3xl md:text-4xl mb-1 ${color}`}>
        {count}{suffix}
      </div>
      <p className="font-orbitron text-xs text-white mb-1">{label}</p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </div>
  );
}

export default function InvestorMetricsSection() {
  return (
    <section id="investor-metrics" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-gold/30 text-galactic-gold text-sm font-orbitron mb-4">
            <TrendingUp className="w-4 h-4" /> Feature 8 of 12
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Investor KPI Dashboard
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Transparent metrics that prove traction. We build in public because our numbers tell the story better than slides ever could.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {metrics.map(m => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        <div className="mt-10 max-w-3xl mx-auto glass-effect p-6 rounded-2xl border border-galactic-gold/20">
          <h3 className="font-orbitron font-bold text-center text-neon-yellow mb-4">Investment Opportunity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Target Raise", value: "$2M", sub: "Seed/Series A" },
              { label: "Target ARR", value: "$1M+", sub: "By Q4 2025" },
              { label: "Equity Offered", value: "10–15%", sub: "Negotiable" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="p-3 rounded-xl bg-space-dark/60">
                <div className="font-orbitron font-black text-xl gradient-text">{value}</div>
                <p className="font-orbitron text-xs text-galactic-gold mt-1">{label}</p>
                <p className="text-gray-500 text-xs">{sub}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <a href="/contact" className="text-galactic-orange hover:text-galactic-gold font-orbitron text-sm underline underline-offset-4 transition-colors">
              Request Investor Deck →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
