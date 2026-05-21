import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      id="backToTop"
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed z-50 flex items-center justify-center w-11 h-11 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-galactic-orange"
      style={{
        bottom: "32px",
        right: "32px",
        background: "linear-gradient(135deg, var(--galactic-orange), var(--galactic-gold))",
        boxShadow: "0 4px 20px rgba(180,25,25,0.4)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <ChevronUp className="w-5 h-5 text-white" />
    </button>
  );
}
