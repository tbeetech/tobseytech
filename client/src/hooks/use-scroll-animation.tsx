import { useEffect, useRef } from "react";

export function useScrollAnimation() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === 'undefined' || !window.gsap || !window.ScrollTrigger) {
      return;
    }

    const { gsap, ScrollTrigger } = window;

    const animation = gsap.fromTo(element,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger: any) => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, []);

  return elementRef;
}
