import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import TechTrendsSection from "@/components/sections/TechTrendsSection";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function FeatureTechTrendsPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>Tech Trends Radar – TOBSEYTECH</title>
      <Navigation />
      <main className="pt-20">
        <TechTrendsSection />
        <div className="container mx-auto px-6 py-10 text-center border-t border-galactic-orange/10">
          <Link href="/features">
            <Button variant="outline" className="border-galactic-orange/40 text-galactic-orange font-orbitron text-xs hover:bg-galactic-orange/10">
              <ArrowLeft className="w-3 h-3 mr-1" /> Back to All Features
            </Button>
          </Link>
          &nbsp;&nbsp;
          <Link href="/contact">
            <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs">
              Book a Demo <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
