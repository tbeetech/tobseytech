import { useRef, useEffect, useState } from "react";
import { Globe2, MapPin } from "lucide-react";

const regions = [
  { name: "Nigeria", flag: "🇳🇬", clients: 45, color: "#22c55e", x: 50, y: 52 },
  { name: "Ghana", flag: "🇬🇭", clients: 18, color: "#22c55e", x: 46, y: 53 },
  { name: "Kenya", flag: "🇰🇪", clients: 22, color: "#00E5FF", x: 57, y: 56 },
  { name: "South Africa", flag: "🇿🇦", clients: 15, color: "#9C27B0", x: 53, y: 67 },
  { name: "UK", flag: "🇬🇧", clients: 12, color: "#4CAF50", x: 47, y: 30 },
  { name: "USA", flag: "🇺🇸", clients: 8, color: "#2196F3", x: 22, y: 38 },
  { name: "Canada", flag: "🇨🇦", clients: 5, color: "#FF5722", x: 20, y: 28 },
  { name: "UAE", flag: "🇦🇪", clients: 9, color: "#4DB6AC", x: 62, y: 43 },
  { name: "Rwanda", flag: "🇷🇼", clients: 7, color: "#AB47BC", x: 56, y: 57 },
  { name: "Ethiopia", flag: "🇪🇹", clients: 6, color: "#FF7043", x: 58, y: 52 },
  { name: "Senegal", flag: "🇸🇳", clients: 4, color: "#26A69A", x: 43, y: 50 },
  { name: "Cameroon", flag: "🇨🇲", clients: 5, color: "#FFCA28", x: 51, y: 55 },
  { name: "Tanzania", flag: "🇹🇿", clients: 8, color: "#EF5350", x: 56, y: 61 },
  { name: "Australia", flag: "🇦🇺", clients: 3, color: "#42A5F5", x: 82, y: 70 },
];

export default function GlobalImpactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const totalClients = regions.reduce((a, r) => a + r.clients, 0);

  return (
    <section id="global-impact" className="page-section py-20">
      <div className="container mx-auto px-6" ref={ref}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-4">
            <Globe2 className="w-4 h-4" /> Feature 15 of 16
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Global Impact Map
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Born in Africa, built for the world. TOBSEYTECH serves clients across {regions.length} countries and counting.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Map container */}
          <div className="glass-effect rounded-2xl border border-galactic-orange/20 p-6 mb-8 relative overflow-hidden" style={{ minHeight: "300px" }}>
            {/* Background grid */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "linear-gradient(rgba(255,140,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,140,0,0.3) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            {/* Dots on "map" */}
            <div className="relative" style={{ height: "260px" }}>
              {regions.map((region, i) => (
                <div
                  key={region.name}
                  className={`absolute transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
                  style={{
                    left: `${region.x}%`,
                    top: `${region.y}%`,
                    transform: "translate(-50%, -50%)",
                    transitionDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={() => setHovered(region.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <div
                    className="relative cursor-pointer"
                    style={{ zIndex: hovered === region.name ? 10 : 1 }}
                  >
                    {/* Ping animation */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-40"
                      style={{ background: region.color, animationDuration: `${2 + (i % 3)}s` }}
                    />
                    <div
                      className="relative w-4 h-4 rounded-full border-2 border-white/30 flex items-center justify-center"
                      style={{ background: region.color }}
                    >
                      <MapPin className="w-2 h-2 text-white" />
                    </div>
                    {/* Tooltip */}
                    {hovered === region.name && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-space-dark border border-galactic-orange/40 rounded-lg text-xs font-orbitron whitespace-nowrap z-20">
                        <span className="mr-1">{region.flag}</span>
                        <span className="text-white">{region.name}</span>
                        <span className="text-gray-400 ml-1">({region.clients} clients)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Region list */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {regions.slice(0, 14).map((region) => (
              <div
                key={region.name}
                className="text-center p-2 rounded-xl border border-white/10 hover:border-galactic-orange/30 transition-colors group"
              >
                <div className="text-xl mb-1">{region.flag}</div>
                <div className="font-orbitron text-xs text-white">{region.name}</div>
                <div className="text-xs font-orbitron" style={{ color: region.color }}>{region.clients}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="font-orbitron text-gray-400 text-sm">
              <span className="text-galactic-orange font-bold text-lg">{totalClients}+</span> clients across{" "}
              <span className="text-galactic-orange font-bold">{regions.length}</span> countries
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
