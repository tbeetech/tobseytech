import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 500, suffix: "+", label: "Leads Organized Monthly", sub: "Automated CRM pipeline" },
  { value: 80, suffix: "%", label: "Customer Queries Automated", sub: "WhatsApp AI responder" },
  { value: 10, suffix: "x", label: "Content Output Multiplier", sub: "1 script → 10 posts in 30s" },
  { value: 8, suffix: "+", label: "Service Verticals", sub: "End-to-end digital solutions" },
  { value: 95, suffix: "%", label: "On-Time Delivery Target", sub: "Milestone-based contracts" },
  { value: 30, suffix: "+", label: "Q1 Pipeline Leads", sub: "Qualified prospects goal" },
];

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);

  return count;
}

function StatCard({ value, suffix, label, sub }: (typeof stats)[0]) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const count = useCountUp(value, 1400, active);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="glass-effect p-6 rounded-2xl border border-galactic-orange/20 text-center hover:border-galactic-orange/50 transition-colors">
      <div className="font-orbitron font-black text-4xl md:text-5xl gradient-text mb-2">
        {count}{suffix}
      </div>
      <p className="font-orbitron text-sm text-neon-yellow mb-1">{label}</p>
      <p className="text-gray-400 text-xs">{sub}</p>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section id="stats" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            By the Numbers
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Real results from real systems, proof over promises.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
