import { Cross, Wifi, Zap, Church, BookOpen, Radio } from "lucide-react";

const godInclinedPrinciples = [
  {
    icon: Cross,
    title: "Purpose-Driven Design",
    body: "Every solution we build starts with a God-given purpose. Technology is a tool for transformation, not just productivity.",
    color: "text-galactic-gold",
    bg: "bg-galactic-gold/10",
    border: "border-galactic-gold/30",
  },
  {
    icon: BookOpen,
    title: "Wisdom-Led Engineering",
    body: "We apply biblical wisdom principles, integrity, stewardship, excellence, to every line of code and every client engagement.",
    color: "text-neon-yellow",
    bg: "bg-neon-yellow/10",
    border: "border-neon-yellow/30",
  },
  {
    icon: Church,
    title: "Kingdom Impact First",
    body: "Projects are evaluated not just for ROI, but for Kingdom impact. We prioritise work that advances righteousness, justice, and community upliftment.",
    color: "text-galactic-orange",
    bg: "bg-galactic-orange/10",
    border: "border-galactic-orange/30",
  },
];

const churchDigitalServices = [
  {
    icon: Radio,
    title: "Live Streaming & Broadcast",
    desc: "Real-time Sunday service streaming, event broadcast pipelines, and multi-platform distribution for churches of any size.",
  },
  {
    icon: Wifi,
    title: "Church Management Systems",
    desc: "Async-first member databases, attendance tracking, giving portals, and pastoral communication platforms.",
  },
  {
    icon: Zap,
    title: "Ministry Automation",
    desc: "Automated follow-up funnels for new converts, prayer request handling, event registration bots, and WhatsApp church bots.",
  },
  {
    icon: BookOpen,
    title: "Digital Discipleship Tools",
    desc: "Online Bible study portals, sermon archives, devotional apps, and e-learning platforms for Kingdom education.",
  },
];

const realtimePillars = [
  {
    label: "Asynchronous Architecture",
    desc: "Message queues, background workers, and event-driven pipelines ensure every operation is non-blocking and resilient.",
    badge: "ASYNC",
    color: "text-neon-cyan",
    badgeColor: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40",
  },
  {
    label: "Real-Time Notifications",
    desc: "WebSocket-powered live alerts, instant chat, and push notifications keep users connected without page refreshes.",
    badge: "LIVE",
    color: "text-galactic-green",
    badgeColor: "bg-galactic-green/20 text-galactic-green border-galactic-green/40",
  },
  {
    label: "Event-Driven Updates",
    desc: "Server-sent events and reactive state management mean your data is always current, for services, blogs, and dashboards alike.",
    badge: "REALTIME",
    color: "text-galactic-orange",
    badgeColor: "bg-galactic-orange/20 text-galactic-orange border-galactic-orange/40",
  },
];

export default function KingdomPrinciplesSection() {
  return (
    <section id="kingdom-principles" className="page-section py-16 sm:py-20 bg-deep-space">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-gold/40 text-galactic-gold text-sm font-orbitron mb-4">
            <Cross className="w-3.5 h-3.5" /> Kingdom Enhancement Principles
          </div>
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-4 gradient-text">
            God-Inclined Project Methodology
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Our work is grounded in faith-first thinking. Every project, feature, and partnership is measured against Kingdom values 
            excellence, integrity, and purpose-driven impact.
          </p>
        </div>

        {/* God-Inclined Principles */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16 sm:mb-20">
          {godInclinedPrinciples.map(({ icon: Icon, title, body, color, bg, border }) => (
            <div key={title} className={`glass-effect p-6 rounded-2xl border ${border} hover:shadow-lg transition-all`}>
              <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h4 className={`font-orbitron font-bold text-sm mb-2 ${color}`}>{title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Church Digital Technology */}
        <div className="mb-16 sm:mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-3">
              <Church className="w-4 h-4" /> Church Digital Technology
            </div>
            <h3 className="font-orbitron font-bold text-xl sm:text-2xl gradient-text mb-2">
              Enhancing the Church with Digital Innovation
            </h3>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              We believe the Church deserves world-class digital infrastructure. From live-streaming Sunday services
              to async discipleship platforms, we build technology that serves the Body of Christ.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {churchDigitalServices.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center hover:border-galactic-gold/50 transition-colors">
                <div className="mx-auto mb-4 w-11 h-11 flex items-center justify-center rounded-full bg-galactic-gold/20">
                  <Icon className="w-5 h-5 text-galactic-gold" />
                </div>
                <h4 className="font-orbitron text-sm font-bold text-galactic-gold mb-2">{title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Async & Real-Time Platform */}
        <div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-green/30 text-galactic-green text-sm font-orbitron mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-galactic-green animate-ping" />
              Async & Real-Time Platform
            </div>
            <h3 className="font-orbitron font-bold text-xl sm:text-2xl gradient-text mb-2">
              Always On. Never Blocking.
            </h3>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              TOBSEYTECH's platform is built on an asynchronous, event-driven foundation, delivering real-time
              experiences for chat, notifications, dashboards, and content, with zero downtime for your users.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {realtimePillars.map(({ label, desc, badge, color, badgeColor }) => (
              <div key={label} className="glass-effect p-6 rounded-2xl border border-white/10 hover:border-galactic-green/30 transition-all text-center">
                <span className={`inline-block px-3 py-1 rounded-full border text-xs font-orbitron font-bold mb-4 ${badgeColor}`}>
                  {badge}
                </span>
                <h4 className={`font-orbitron font-bold text-sm mb-2 ${color}`}>{label}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
