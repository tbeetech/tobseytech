import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.particlesJS && particlesRef.current) {
      window.particlesJS('particles-js', {
        particles: {
          number: { value: 120, density: { enable: true, value_area: 800 } },
          color: { value: ['#FF8C00', '#FFD700', '#00FF00', '#FF0000'] },
          shape: { type: 'circle' },
          opacity: { value: 0.7, random: true },
          size: { value: 4, random: true },
          line_linked: {
            enable: true,
            distance: 200,
            color: '#FF8C00',
            opacity: 0.6,
            width: 2
          },
          move: {
            enable: true,
            speed: 3,
            direction: 'none',
            random: true,
            straight: false,
            out_mode: 'out',
            attract: { enable: true, rotateX: 600, rotateY: 1200 }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: { enable: true, mode: 'grab' },
            onclick: { enable: true, mode: 'repulse' }
          },
          modes: {
            grab: {
              distance: 300,
              line_linked: {
                opacity: 1
              }
            },
            repulse: {
              distance: 150,
              duration: 0.4
            }
          }
        },
        retina_detect: true
      });
    }
  }, []);

  return (
    <>
      {/* Starfield Background */}
      <div 
        id="starfield"
        className="starfield fixed w-full h-full z-[-2] top-0 left-0"
      />
      
      {/* Particle System */}
      <div 
        id="particles-js" 
        ref={particlesRef}
        className="fixed w-full h-full z-[-1] top-0 left-0"
      />
    </>
  );
}

// Type declaration for particles.js
declare global {
  interface Window {
    particlesJS: (id: string, config: any) => void;
  }
}
