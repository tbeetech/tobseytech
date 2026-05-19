// Animations disabled for performance — all GSAP/ScrollTrigger effects removed.
export function initializeAnimations() {
  // No-op: all heavy GSAP scroll/hover/parallax animations removed for performance.
}

// Type declarations for GSAP (kept for third-party script compatibility)
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}
