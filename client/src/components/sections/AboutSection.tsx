import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pillars = [
  { label: "Accessibility", desc: "Our solutions are built for every business size — from solo founders to growing teams — without needing a technical background." },
  { label: "Reliability", desc: "We work with clear timelines, quality checkpoints, and milestone-based contracts so you always know where your project stands." },
  { label: "Measurable Impact", desc: "Every engagement is tied to a real outcome — whether that's more leads, time saved, revenue grown, or a better customer experience." },
];

const carouselSlides = [
  {
    heading: "What We Do",
    body: "TOBSEYTECH is a digital agency that helps businesses automate their operations, build professional websites and apps, and leverage AI to work smarter. We handle the technical heavy lifting so you can focus on growing your business.",
  },
  {
    heading: "How We Work",
    body: "We start every project by understanding your goals, then design a practical solution that fits your timeline and budget. Clear milestones, transparent pricing, and a single point of contact — no surprises.",
  },
  {
    heading: "Who We Serve",
    body: "We work with startups, media companies, SMEs, and service businesses across Africa and beyond. Whether you are a first-time founder or an established brand, we bring the same focused attention to every project.",
  },
  {
    heading: "Why Choose Us",
    body: "Founder-level attention on every project. We don't hand your work off to juniors. Tobi and the team stay hands-on from kickoff to delivery, and we measure success by the results you see — not just the work we ship.",
  },
];

export default function AboutSection() {
  const [current, setCurrent] = useState(0);
  const total = carouselSlides.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 5000);
    return () => clearInterval(timer);
  }, [total]);

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <section id="about" className="page-section py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Who We Are */}
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start mb-14 sm:mb-20">
          <div>
            <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-6 gradient-text">
              Who We Are
            </h2>
            <p className="text-gray-300 mb-4 leading-relaxed">
              TOBSEYTECH is a digital agency built to deliver automation-first solutions to media houses, SMEs, startups,
              and social-impact organisations across Africa and globally.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Founded by <span className="text-galactic-orange font-semibold">Oyebade Tobi</span> and co-founded by{" "}
              <span className="text-galactic-orange font-semibold">Seyi Olatunde</span>, the team combines strategy,
              design, engineering, and operations under one roof. We close the trust gap in Africa's digital economy with
              clear scopes, reliable timelines, and quality delivery.
            </p>
            <ul className="space-y-3">
              {pillars.map(({ label, desc }) => (
                <li key={label} className="flex gap-3">
                  <span className="mt-1 w-2 h-2 shrink-0 rounded-full bg-galactic-orange" />
                  <span className="text-gray-300 text-sm">
                    <span className="text-neon-yellow font-orbitron font-bold">{label}: </span>
                    {desc}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Carousel */}
          <div className="glass-effect rounded-2xl border border-galactic-orange/20 p-6 sm:p-8 relative">
            <div className="min-h-[180px] flex flex-col justify-center">
              <h3 className="font-orbitron font-bold text-lg text-galactic-orange mb-3">
                {carouselSlides[current].heading}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {carouselSlides[current].body}
              </p>
            </div>

            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-8 h-8 rounded-full border border-galactic-orange/30 flex items-center justify-center text-galactic-orange hover:bg-galactic-orange/10 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                {carouselSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === current ? "bg-galactic-orange" : "bg-galactic-orange/30"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                aria-label="Next"
                className="w-8 h-8 rounded-full border border-galactic-orange/30 flex items-center justify-center text-galactic-orange hover:bg-galactic-orange/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
