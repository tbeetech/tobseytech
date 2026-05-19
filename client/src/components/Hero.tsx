import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-space-black">
      {/* Static gradient background — replaces heavy canvas animation loop */}
      <div className="absolute inset-0 bg-gradient-to-br from-galactic-orange/5 via-space-black to-neon-cyan/5 pointer-events-none" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-black/20 to-space-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-xs font-orbitron">
            <span className="w-1.5 h-1.5 rounded-full bg-galactic-orange" />
            God-Inclined Digital Platform
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-green/40 text-galactic-green text-xs font-orbitron">
            <span className="w-1.5 h-1.5 rounded-full bg-galactic-green" />
            Live · Real-Time · Async
          </div>
        </div>

        <h1 className="font-orbitron font-black text-4xl sm:text-5xl md:text-7xl gradient-text mb-6 leading-tight">
          Automate.<br className="sm:hidden" /> Scale. Transform.
        </h1>

        <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-3 leading-relaxed">
          Empowering businesses with AI-powered automation, 12 real-time features, and intelligent systems that scale with you.
        </p>
        <p className="text-galactic-gold text-sm sm:text-base max-w-xl mx-auto mb-10 font-orbitron leading-relaxed">
          Kingdom Enhancement Technology, Serving Churches & Organisations in Real Time
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold px-8 hover:opacity-90 transition-opacity"
            >
              Book a Consultation
            </Button>
          </Link>
          <Link href="/features">
            <Button
              size="lg"
              variant="outline"
              className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron px-8"
            >
              Explore 12 Real-Time Features
            </Button>
          </Link>
        </div>

        <div className="mt-16">
          <ChevronDown className="w-6 h-6 text-galactic-orange/50 mx-auto" />
        </div>
      </div>
    </section>
  );
}
