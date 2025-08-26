import { useEffect } from "react";
import CyberButton from "@/components/ui/cyber-button";
import Globe from "@/components/Globe";

export default function HeroSection() {
  useEffect(() => {
    // Add floating elements animation
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
      const delay = index * 0.5;
      (element as HTMLElement).style.animationDelay = `${delay}s`;
    });
  }, []);

  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="page-section galactic-grid starfield flex items-center justify-center relative">
      <Globe />
      
      <div className="container mx-auto px-6 text-center z-20">
        <div className="animate-fade-in">
          <h1 className="font-orbitron font-black text-4xl md:text-6xl lg:text-8xl mb-6 gradient-text animate-pulse-slow">
            TOBSEYTECH
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Future-Forward Digital Solutions • AI-Powered Innovation • Kingdom Enhancement Technology
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button 
              onClick={scrollToServices}
              className="galactic-button px-8 py-4 font-orbitron font-bold text-galactic-orange"
              data-testid="button-explore-services"
            >
              EXPLORE SERVICES
            </button>
            <button 
              onClick={scrollToContact}
              className="galactic-button px-8 py-4 font-orbitron font-bold text-galactic-green"
              data-testid="button-start-project"
            >
              START PROJECT
            </button>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-galactic-orange rounded-full animate-float opacity-60 floating-element animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-6 h-6 bg-galactic-gold rounded-full animate-float opacity-40 floating-element animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-10 w-3 h-3 bg-galactic-green rounded-full animate-float opacity-50 floating-element animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* Shooting Stars */}
      <div className="absolute w-2 h-2 bg-white rounded-full opacity-0" style={{animation: 'shootingStars 8s linear infinite'}}></div>
      <div className="absolute w-1 h-1 bg-galactic-gold rounded-full opacity-0" style={{animation: 'shootingStars 12s linear infinite', animationDelay: '3s'}}></div>
      <div className="absolute w-1 h-1 bg-galactic-orange rounded-full opacity-0" style={{animation: 'shootingStars 10s linear infinite', animationDelay: '6s'}}></div>
    </section>
  );
}
