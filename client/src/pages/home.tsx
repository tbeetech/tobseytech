import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import CaseStudiesSection from "@/components/sections/CaseStudiesSection";
import CTASection from "@/components/CTASection";
import FounderSection from "@/components/sections/FounderSection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-space-black text-white overflow-x-hidden">
      <title>TOBSEYTECH - AI-Speed-Up IT Solutions</title>
      
      <Navigation />

      <main>
        <Hero />
        <ServicesSection />
        <CTASection />
        <CaseStudiesSection />
        <FounderSection />
        <AboutSection />
        <ContactSection />

        {/* Features Hub CTA */}
        <section className="py-16 bg-deep-space border-t border-galactic-orange/20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text mb-4">
              Explore Our Central Hub
            </h2>
            <p className="text-gray-300 max-w-xl mx-auto mb-6 text-sm">
              View our complete interactive feature showcase built to demonstrate platform capabilities.
            </p>
            <Link href="/features">
              <Button size="lg" className="bg-galactic-orange text-white font-orbitron font-bold hover:opacity-90">
                <Layers className="w-4 h-4 mr-2" /> Central Hub
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="bg-deep-space border-t border-galactic-orange/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 border-2 border-galactic-orange rounded-full flex items-center justify-center bg-gradient-to-br from-galactic-orange to-galactic-gold">
                  <span className="text-white font-orbitron font-bold text-xl">TST</span>
                </div>
                <span className="font-orbitron font-bold text-xl gradient-text">TOBSEYTECH</span>
              </div>
              <p className="text-gray-400 text-sm">Automate. Scale. Transform.</p>
              <p className="text-gray-500 text-xs mt-1 font-orbitron">Client First · AI-Powered IT Solutions</p>
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-neon-yellow mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/"><a className="hover:text-neon-yellow transition-colors">Home</a></Link></li>
                <li><Link href="/services"><a className="hover:text-neon-yellow transition-colors">Services</a></Link></li>
                <li><Link href="/case-studies"><a className="hover:text-neon-yellow transition-colors">Case Studies</a></Link></li>
                <li><Link href="/about"><a className="hover:text-neon-yellow transition-colors">About</a></Link></li>
                <li><Link href="/contact"><a className="hover:text-neon-yellow transition-colors">Contact</a></Link></li>
                <li><Link href="/blog"><a className="hover:text-neon-yellow transition-colors">Blog</a></Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-orbitron font-bold text-neon-yellow mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-galactic-orange/20 rounded-lg flex items-center justify-center hover:bg-galactic-orange/40 transition-colors">
                  <svg className="w-5 h-5 text-galactic-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/oyebade-tobi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-galactic-orange/20 rounded-lg flex items-center justify-center hover:bg-galactic-orange/40 transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5 text-galactic-orange" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-galactic-orange/30 mt-8 pt-8 text-center text-gray-400">
            <p className="gradient-text font-orbitron font-bold">TOBSEYTECH</p>
            <p className="text-xs mt-1 text-gray-500 font-orbitron">Automate. Scale. Transform. · AI-Speed-Up IT Solutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
