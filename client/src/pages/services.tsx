import Navigation from "@/components/Navigation";
import ServicesSection from "@/components/sections/ServicesSection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <main className="pt-24">
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
