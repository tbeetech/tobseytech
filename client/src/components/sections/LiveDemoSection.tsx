import { useState } from "react";
import { Play, Monitor, MessageSquare, BarChart3, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const demoSteps = [
  {
    id: "automation",
    icon: Zap,
    title: "Automation in Action",
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    preview: (
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3 p-3 bg-galactic-orange/10 border border-galactic-orange/20 rounded-lg animate-pulse">
          <div className="w-2 h-2 rounded-full bg-galactic-green" />
          <span className="text-xs font-orbitron text-gray-300">New lead captured → CRM updated → Welcome email sent</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg" style={{ animationDelay: "0.5s" }}>
          <div className="w-2 h-2 rounded-full bg-neon-cyan" />
          <span className="text-xs font-orbitron text-gray-300">WhatsApp message received → AI replies in {'<'}2s</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-neon-yellow/10 border border-neon-yellow/20 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-neon-yellow" />
          <span className="text-xs font-orbitron text-gray-300">Social post scheduled → 10 platform variants created</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-galactic-green text-xs font-orbitron">✓ 3 workflows running • 0 manual steps needed</span>
        </div>
      </div>
    ),
  },
  {
    id: "ai-chat",
    icon: MessageSquare,
    title: "AI Chat Assistant",
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    preview: (
      <div className="space-y-3 p-4">
        {[
          { sender: "user", text: "What's your pricing for automation?" },
          { sender: "ai", text: "Great question! Our automation packages start at $500/project. For ongoing retainers, our Growth plan at $1,500/month covers 3 service verticals including automation setup, monitoring, and optimisation. Want me to book you a free discovery call?" },
          { sender: "user", text: "Yes please!" },
          { sender: "ai", text: "Perfect! I've sent a booking link to your email. Our team responds within 2 hours. Is there anything specific you'd like to automate first?" },
        ].map((msg, i) => (
          <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
              msg.sender === "user"
                ? "bg-galactic-orange/20 text-gray-200 border border-galactic-orange/20"
                : "bg-neon-cyan/10 text-gray-300 border border-neon-cyan/20"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Live Analytics Dashboard",
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    preview: (
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Leads Today", value: "47", delta: "+12%" },
            { label: "Conversion", value: "8.3%", delta: "+2.1%" },
            { label: "Revenue", value: "$3.2K", delta: "+18%" },
          ].map(({ label, value, delta }) => (
            <div key={label} className="p-2 bg-neon-yellow/5 border border-neon-yellow/20 rounded-lg text-center">
              <div className="font-orbitron font-bold text-sm text-neon-yellow">{value}</div>
              <div className="text-galactic-green text-xs">{delta}</div>
              <div className="text-gray-500 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </div>
        <div className="h-16 flex items-end gap-1">
          {[30, 50, 40, 70, 60, 80, 95].map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `rgba(34, 197, 94, ${0.2 + i * 0.08})` }} />
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 mt-2 font-orbitron">7-day leads trend</p>
      </div>
    ),
  },
  {
    id: "platform",
    icon: Monitor,
    title: "Platform Overview",
    color: "text-neon-purple",
    border: "border-neon-purple",
    preview: (
      <div className="p-4 space-y-2">
        {[
          { icon: "🤝", label: "Community Chat", users: "1.2K online" },
          { icon: "📚", label: "Learning Hub", courses: "24 courses" },
          { icon: "🏆", label: "Challenges", active: "4 active" },
          { icon: "👥", label: "Mentorship", sessions: "320 completed" },
          { icon: "📰", label: "Tech Blog", posts: "85 articles" },
          { icon: "🔗", label: "Network", connections: "4.8K links" },
        ].map(({ icon, label, ...rest }) => {
          const sub = Object.values(rest)[0];
          return (
            <div key={label} className="flex items-center justify-between p-2 bg-neon-purple/5 border border-neon-purple/10 rounded-lg">
              <span className="text-xs text-gray-300 font-orbitron"><span className="mr-2">{icon}</span>{label}</span>
              <span className="text-neon-purple text-xs font-orbitron">{sub}</span>
            </div>
          );
        })}
      </div>
    ),
  },
];

export default function LiveDemoSection() {
  const [activeDemo, setActiveDemo] = useState("automation");
  const [playing, setPlaying] = useState(false);

  const active = demoSteps.find(d => d.id === activeDemo)!;

  return (
    <section id="live-demo" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-4">
            <Play className="w-4 h-4" /> Real-Time Feature
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Live Platform Demo
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See TOBSEYTECH in action before you commit. Explore automation workflows, AI chat, analytics, and the full platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {/* Tabs */}
          <div className="space-y-3">
            {demoSteps.map((step) => {
              const Icon = step.icon;
              const isActive = activeDemo === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => { setActiveDemo(step.id); setPlaying(false); }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? `${step.border}/50 bg-space-dark/80 ${step.color}`
                      : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? step.color : ""}`} />
                    <span className="font-orbitron text-xs">{step.title}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </div>
                </button>
              );
            })}
            <Button
              onClick={() => setPlaying(true)}
              className="w-full bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs"
            >
              <Play className="w-3.5 h-3.5 mr-1" /> {playing ? "Playing..." : "Play Demo"}
            </Button>
          </div>

          {/* Preview window */}
          <div className={`md:col-span-2 glass-effect rounded-2xl border ${active.border}/30 overflow-hidden`}>
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="w-2.5 h-2.5 rounded-full bg-galactic-red/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-neon-yellow/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-galactic-green/60" />
              <span className={`ml-3 font-orbitron text-xs ${active.color}`}>{active.title}</span>
              {playing && (
                <div className="ml-auto flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-galactic-green animate-pulse" />
                  <span className="text-galactic-green text-xs font-orbitron">LIVE</span>
                </div>
              )}
            </div>
            {active.preview}
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="/contact">
            <Button size="lg" className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold">
              Book a Live 1:1 Demo
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
