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
    image: "https://zd-brightspot.s3.us-east-1.amazonaws.com/wp-content/uploads/2024/02/26091442/Shutterstock_1133982038.jpg",
    imageAlt: "Automation and robotics technology",
  },
  {
    icon: Code,
    title: "Web & App Development",
    description: "We build fast, professional websites and mobile apps that look great, work on any device, and are designed to turn visitors into customers.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80",
    imageAlt: "Web and app development on laptop",
  },
  {
    icon: Brain,
    title: "AI Integrations",
    description: "We connect AI tools to your existing systems: chatbots that answer customer questions, smart search, and recommendations that save your team hours every day.",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    imageAlt: "Artificial intelligence and machine learning",
  },
  {
    icon: Palette,
    title: "Branding & Identity",
    description: "Logo design, brand guidelines, and visual kits that give your business a consistent and professional look across every platform.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80",
    imageAlt: "Brand identity and design",
  },
  {
    icon: BarChart3,
    title: "Strategic Consulting",
    description: "Clear product planning, process reviews, and go-to-market strategies to help you grow with less guesswork and more direction.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
    imageAlt: "Strategic business consulting and analytics",
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
              {services.map(({ icon: Icon, title, description, image, imageAlt }) => (
                <CarouselItem key={title} className="sm:basis-1/2 lg:basis-1/3">
                  <div className="card hover:border-galactic-orange/50 transition-colors h-full overflow-hidden p-0">
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
                      <img
                        src={image}
                        alt={imageAlt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        style={{ maxHeight: "180px" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-space-dark/90 to-transparent" />
                      <div className="absolute bottom-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-galactic-orange/20 text-galactic-orange border border-galactic-orange/30">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-orbitron text-base mb-2 text-neon-yellow">{title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
                    </div>
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

