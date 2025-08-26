import ServiceCard from "@/components/ui/service-card";
import { 
  Palette, 
  Code, 
  Brain, 
  TrendingUp, 
  Camera, 
  Zap 
} from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      icon: Palette,
      title: "Branding & Identity",
      description: "Logo systems, brand guidelines, storytelling, and complete rollout toolkits",
      features: ["Logo Systems & Guidelines", "Social & Print Toolkits", "Campaign Launch Kits"],
      gradient: "from-galactic-orange to-galactic-gold"
    },
    {
      icon: Code,
      title: "Web/App Development",
      description: "Responsive websites, mobile apps, and customer portals with clean APIs",
      features: ["Responsive Websites", "Cross-platform Mobile Apps", "Analytics & SEO Optimization"],
      gradient: "from-galactic-gold to-galactic-green"
    },
    {
      icon: Brain,
      title: "AI Integration",
      description: "Chat assistants, knowledge bases, and intelligent automation systems",
      features: ["Chat Assistants & RAG", "Workflow Automation", "Analytics & Recommendations"],
      gradient: "from-galactic-green to-galactic-orange"
    },
    {
      icon: TrendingUp,
      title: "Digital Marketing",
      description: "Paid ads, email funnels, CRM integration with measurable outcomes",
      features: ["Paid Ads & Email Funnels", "Content Calendars", "Reporting Dashboards"],
      gradient: "from-galactic-orange to-galactic-red"
    },
    {
      icon: Camera,
      title: "Content Creation",
      description: "Video editing, scripts, photography, and comprehensive storytelling",
      features: ["Video Editing & Scripts", "Photography Direction", "Long-form & Short-form Content"],
      gradient: "from-galactic-red to-galactic-gold"
    },
    {
      icon: Zap,
      title: "Motion Graphics",
      description: "Explainers, intros, kinetic typography, and event visuals",
      features: ["Explainer Videos & Intros", "Kinetic Typography", "Event & Tutorial Visuals"],
      gradient: "from-galactic-gold to-galactic-green"
    }
  ];

  return (
    <section id="services" className="page-section py-20 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl lg:text-5xl mb-6 gradient-text">
            DIGITAL SERVICES MATRIX
          </h2>
          <p className="text-xl text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Comprehensive technology solutions powered by AI, delivered with precision and innovation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              features={service.features}
              gradient={service.gradient}
              data-testid={`service-card-${index}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
