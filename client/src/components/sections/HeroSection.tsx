import CyberButton from "@/components/ui/cyber-button";
import Globe from "@/components/Globe";

export default function HeroSection() {
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
    <section id="home" className="page-section galactic-grid flex items-center justify-center relative">
      <Globe />
      
      <div className="container mx-auto px-6 text-center z-20">
        <div>
          <h1 className="font-orbitron font-black text-4xl md:text-6xl lg:text-8xl mb-6 gradient-text">
            TOBSEYTECH
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-4 text-galactic-gold max-w-3xl mx-auto font-orbitron">
            Future-Forward Digital Solutions • AI-Powered Innovation • Kingdom Enhancement Technology
          </p>
          <p className="text-sm md:text-base mb-8 text-galactic-green max-w-2xl mx-auto font-orbitron">
            God-Inclined Methodology · Church Digital Technology · Asynchronous & Real-Time
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
    </section>
  );
}
