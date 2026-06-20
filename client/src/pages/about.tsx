import Navigation from "@/components/Navigation";
import AboutSection from "@/components/sections/AboutSection";
import FounderSection from "@/components/sections/FounderSection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-6 text-center mb-4 pt-4">
          <h1 className="font-orbitron font-bold text-4xl gradient-text mb-4">About ARCOLYTE TECHNOLOGIES</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            A digital agency built on clarity, delivery, and founder-level attention. Here's who we are and how we work.
          </p>
        </div>
        <AboutSection />
        <FounderSection />
        <div className="py-16 text-center bg-deep-space border-t border-galactic-orange/10">
          <p className="text-gray-300 mb-6 max-w-lg mx-auto">
            Want to work with us? Let's start with a conversation.
          </p>
          <Link href="/contact">
            <Button className="bg-galactic-orange text-white font-orbitron font-bold hover:opacity-90">
              Contact Us
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
