import { Brain, Code, Bot, GraduationCap } from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "Automation Systems",
    description: "Reduce repetitive tasks and scale content output with custom pipelines, lead sorters and chatbots.",
  },
  {
    icon: Code,
    title: "Web & App Development",
    description: "Dashboards, websites and portals that grow with your business.",
  },
  {
    icon: Brain,
    title: "AI Integrations",
    description: "Make your data work for you with NLP, analytics and recommendations.",
  },
  {
    icon: GraduationCap,
    title: "Corporate Training",
    description: "Upskill teams through practical AI workshops and business sessions.",
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
            Practical engineering to move your business forward.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card text-center">
              <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-neon-yellow text-black">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-orbitron text-xl mb-2 text-neon-yellow">{title}</h3>
              <p className="text-gray-300 text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
