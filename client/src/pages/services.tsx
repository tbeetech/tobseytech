import Navigation from "@/components/Navigation";
import ServicesSection from "@/components/sections/ServicesSection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-6 text-center mb-4 pt-4">
          <h1 className="font-orbitron font-bold text-4xl gradient-text mb-4">Our Services</h1>
          <p className="text-gray-300 max-w-2xl mx-auto mb-2">
            Everything your business needs to automate, grow, and stand out — delivered by a team that stays involved from start to finish.
          </p>
        </div>
        <ServicesSection />
        <div className="py-16 text-center bg-deep-space border-t border-galactic-orange/10">
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Not sure which service fits your needs? Book a free 30-minute consultation and we'll point you in the right direction.
          </p>
          <Link href="/contact">
            <Button className="bg-galactic-orange text-white font-orbitron font-bold hover:opacity-90">
              Book a Free Consultation
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
