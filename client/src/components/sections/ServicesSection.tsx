import { Brain, Code, Bot, Palette, BarChart3 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

const services = [
  {
    icon: Bot,
    title: "Automation Systems",
    description: "We set up smart systems that handle repetitive tasks for you, from responding to leads and sorting emails to running workflows while you sleep.",
  },
  {
    icon: Code,
    title: "Web & App Development",
    description: "We build fast, professional websites and mobile apps that look great, work on any device, and are designed to turn visitors into customers.",
  },
  {
    icon: Brain,
    title: "AI Integrations",
    description: "We connect AI tools to your existing systems: chatbots that answer customer questions, smart search, and recommendations that save your team hours every day.",
  },
  {
    icon: Palette,
    title: "Branding & Identity",
    description: "Logo design, brand guidelines, and visual kits that give your business a consistent and professional look across every platform.",
  },
  {
    icon: BarChart3,
    title: "Strategic Consulting",
    description: "Clear product planning, process reviews, and go-to-market strategies to help you grow with less guesswork and more direction.",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="page-section py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-4 gradient-text">
            Our Services
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Strategy, design, and engineering under one roof. Practical solutions that move your business forward.
          </p>
        </div>
        <div className="relative px-10">
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {services.map(({ icon: Icon, title, description }) => (
                <CarouselItem key={title} className="sm:basis-1/2 lg:basis-1/3">
                  <div className="card text-center hover:border-galactic-orange/50 transition-colors h-full">
                    <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-galactic-orange/20 text-galactic-orange">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-orbitron text-lg mb-2 text-neon-yellow">{title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 bg-space-black/80" />
            <CarouselNext className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 bg-space-black/80" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}

