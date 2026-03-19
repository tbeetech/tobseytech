import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.28;

      // --- Globe wireframe ---
      const latLines = 9;
      const lonLines = 12;
      ctx.lineWidth = 0.6;

      // Latitude lines
      for (let i = 1; i < latLines; i++) {
        const phi = (Math.PI * i) / latLines;
        const r2d = R * Math.sin(phi);
        const y2d = cy + R * Math.cos(phi);
        ctx.beginPath();
        ctx.ellipse(cx, y2d, r2d, r2d * 0.28, 0, 0, Math.PI * 2);
        const alpha = 0.15 + 0.25 * Math.sin(phi);
        ctx.strokeStyle = `rgba(255, 140, 0, ${alpha})`;
        ctx.stroke();
      }

      // Longitude lines (rotating)
      for (let i = 0; i < lonLines; i++) {
        const angle = (Math.PI * 2 * i) / lonLines + t * 0.4;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.scale(1, 0.28);
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        const alpha = 0.12 + 0.15 * Math.abs(Math.cos(angle));
        ctx.strokeStyle = `rgba(255, 200, 0, ${alpha})`;
        ctx.stroke();
        ctx.restore();
      }

      // Globe glow
      const grd = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.1);
      grd.addColorStop(0, "rgba(255,140,0,0.06)");
      grd.addColorStop(0.5, "rgba(255,200,0,0.04)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Globe outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 140, 0, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // --- Oscillating wave rings ---
      for (let w = 0; w < 3; w++) {
        const waveR = R * (1.3 + w * 0.28);
        const segments = 120;
        ctx.beginPath();
        for (let s = 0; s <= segments; s++) {
          const angle = (Math.PI * 2 * s) / segments;
          const wave = Math.sin(angle * 5 + t * (1.2 + w * 0.5)) * (3 + w * 2);
          const r = waveR + wave;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle) * 0.3 + wave * 0.15;
          if (s === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const wAlpha = 0.18 - w * 0.04;
        ctx.strokeStyle = `rgba(0, 220, 255, ${wAlpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // --- Floating matrix dots ---
      const dotCount = 60;
      for (let d = 0; d < dotCount; d++) {
        const seed = d * 137.508;
        const angle = seed % (Math.PI * 2);
        const dist = R * (1.1 + ((seed * 0.023) % 0.7));
        const x = cx + dist * Math.cos(angle + t * 0.15);
        const y = cy + dist * Math.sin(angle + t * 0.15) * 0.35;
        const pulse = 0.4 + 0.6 * Math.sin(t * 2.5 + d);
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 60, ${pulse * 0.7})`;
        ctx.fill();
      }

      t += 0.012;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-space-black">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.92 }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-space-black/20 to-space-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-xs font-orbitron mb-6 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-galactic-orange animate-pulse" />
          Next-Generation Digital Platform
        </div>

        <h1 className="font-orbitron font-black text-4xl sm:text-5xl md:text-7xl gradient-text mb-6 leading-tight">
          Automate.<br className="sm:hidden" /> Scale. Transform.
        </h1>

        <p className="text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Empowering businesses with AI-powered automation, 16 live platform features, and intelligent systems that scale with you.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/book-demo">
            <Button
              size="lg"
              className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold px-8 hover:shadow-[0_0_30px_rgba(255,165,0,0.5)] transition-all"
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
              Explore 16 Features
            </Button>
          </Link>
        </div>

        <div className="mt-16 animate-bounce">
          <ChevronDown className="w-6 h-6 text-galactic-orange/50 mx-auto" />
        </div>
      </div>
    </section>
  );
}
