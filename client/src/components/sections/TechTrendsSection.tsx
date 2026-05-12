import { useRef, useEffect, useState } from "react";
import { Radar } from "recharts";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

const trendData = [
  { subject: "AI / LLMs", A: 95, fullMark: 100 },
  { subject: "Web3", A: 42, fullMark: 100 },
  { subject: "Edge Computing", A: 68, fullMark: 100 },
  { subject: "No-Code Tools", A: 80, fullMark: 100 },
  { subject: "Cybersecurity", A: 88, fullMark: 100 },
  { subject: "Cloud Native", A: 85, fullMark: 100 },
  { subject: "IoT", A: 55, fullMark: 100 },
  { subject: "AR / VR", A: 47, fullMark: 100 },
];

const trendCards = [
  { label: "AI / LLMs", score: 95, color: "#22c55e", insight: "Generative AI is reshaping every industry. TOBSEYTECH builds custom AI integrations on GPT-4, Claude & Gemini." },
  { label: "No-Code Tools", score: 80, color: "#22c55e", insight: "No-code automation reduces time-to-market by 60%. We pair no-code with custom dev for optimal speed." },
  { label: "Cybersecurity", score: 88, color: "#00E5FF", insight: "Cyber threats grew 38% YoY. Every TOBSEYTECH solution includes security-by-design principles." },
  { label: "Cloud Native", score: 85, color: "#9C27B0", insight: "Cloud-native architecture cuts infrastructure costs up to 40% while delivering infinite scalability." },
  { label: "Edge Computing", score: 68, color: "#4CAF50", insight: "Processing data closer to the source reduces latency — key for real-time AI decision-making." },
  { label: "IoT", score: 55, color: "#2196F3", insight: "Connected devices generating actionable business data. We design IoT data pipelines for smart operations." },
];

export default function TechTrendsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="tech-trends" className="page-section py-20">
      <div className="container mx-auto px-6" ref={ref}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 text-neon-purple text-sm font-orbitron mb-4">
            <Activity className="w-4 h-4" /> Feature 4 of 12
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Tech Trends Radar
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Stay ahead of the curve. Here's where the digital world is heading — and how TOBSEYTECH helps you ride every wave.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          {/* Radar Chart */}
          <div className={`transition-all duration-1000 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={trendData}>
                <PolarGrid stroke="rgba(255,140,0,0.15)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#aaa", fontSize: 11, fontFamily: "Orbitron" }}
                />
                <Radar
                  name="Tech Adoption"
                  dataKey="A"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-center text-xs text-gray-500 font-orbitron mt-2">Industry adoption score (0–100)</p>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {trendCards.map((card, i) => (
              <button
                key={card.label}
                onClick={() => setActiveCard(i)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                  activeCard === i
                    ? "border-galactic-orange/50 bg-galactic-orange/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-orbitron text-sm text-white">{card.label}</span>
                  <span className="font-orbitron text-xs" style={{ color: card.color }}>{card.score}%</span>
                </div>
                <div className="h-1.5 bg-space-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700`}
                    style={{
                      width: visible ? `${card.score}%` : "0%",
                      background: card.color,
                      transitionDelay: `${i * 100}ms`,
                    }}
                  />
                </div>
                {activeCard === i && (
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">{card.insight}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
