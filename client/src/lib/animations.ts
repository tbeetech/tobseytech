export function initializeAnimations() {
  if (typeof window === 'undefined' || !window.gsap) {
    return;
  }

  const { gsap } = window;

  // Register ScrollTrigger plugin
  if (window.ScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(this: HTMLElement, e) {
      e.preventDefault();
      const href = this.getAttribute('href');
      if (href?.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          gsap.to(window, {duration: 1, scrollTo: target, ease: "power2.inOut"});
        }
      }
    });
  });

  // Section animations
  gsap.utils.toArray('.page-section').forEach((section: any, i) => {
    if (window.ScrollTrigger) {
      window.ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => {
          gsap.fromTo(section.children, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out" }
          );
        }
      });
    }
  });

  // Service cards 3D hover effect
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function(this: HTMLElement) {
      gsap.to(this, {
        rotationY: 5,
        rotationX: 2,
        z: 10,
        duration: 0.3,
        ease: "power2.out"
      });
    });
    
    card.addEventListener('mouseleave', function(this: HTMLElement) {
      gsap.to(this, {
        rotationY: 0,
        rotationX: 0,
        z: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });

  // Cyber button hover effects
  document.querySelectorAll('.cyber-button').forEach(button => {
    button.addEventListener('mouseenter', function(this: HTMLElement) {
      gsap.to(this, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out"
      });
    });
    
    button.addEventListener('mouseleave', function(this: HTMLElement) {
      gsap.to(this, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      });
    });
  });

  // Parallax effects
  gsap.utils.toArray('.glass-effect').forEach((element: any) => {
    if (window.ScrollTrigger) {
      gsap.fromTo(element, 
        { y: 30, opacity: 0.8 },
        {
          y: 0,
          opacity: 1,
          scrollTrigger: {
            trigger: element,
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: 1
          }
        }
      );
    }
  });

  // Loading animation
  window.addEventListener('load', function() {
    gsap.fromTo('body', 
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" }
    );
  });
}

// Type declarations for GSAP
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}
