import { Brain, Code, Bot, GraduationCap, Palette, Video, BarChart3, Megaphone } from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "Automation Systems",
    description: "Custom pipelines, lead sorters, and chatbots that cut repetitive tasks and scale your content output.",
    tag: "Most Popular",
  },
  {
    icon: Code,
    title: "Web & App Development",
    description: "Responsive websites, customer portals, and cross-platform mobile apps with analytics and conversion-first UX.",
    tag: null,
  },
  {
    icon: Brain,
    title: "AI Integrations",
    description: "Chat assistants, RAG knowledge bases, smart routing, and recommendation engines that make your data work for you.",
    tag: null,
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description: "Paid ads, email/WhatsApp funnels, CRM hooks, and reporting dashboards focused on measurable outcomes.",
    tag: null,
  },
  {
    icon: Palette,
    title: "Branding & Identity",
    description: "Logo systems, brand guidelines, storytelling, social and print toolkits, and launch kits for campaigns.",
    tag: null,
  },
  {
    icon: Video,
    title: "Content Creation",
    description: "Video editing, scripts, reels, copywriting, photography direction, and long/short-form storytelling.",
    tag: null,
  },
  {
    icon: BarChart3,
    title: "Strategic Consulting",
    description: "Product strategy, roadmaps, data and process audits, risk management, and go-to-market planning.",
    tag: null,
  },
  {
    icon: GraduationCap,
    title: "Corporate Training",
    description: "Cohort programs, live workshops, on-demand modules, and curriculum design to upskill your team in AI and digital tools.",
    tag: null,
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Services
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Strategy, design, and engineering under one roof — practical solutions that move your business forward.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description, tag }) => (
            <div key={title} className="card text-center relative hover:border-galactic-orange/50 transition-colors">
              {tag && (
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-galactic-orange/20 text-galactic-orange rounded-full text-xs font-orbitron">
                  {tag}
                </span>
              )}
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-neon-yellow text-black">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron text-lg mb-2 text-neon-yellow">{title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

