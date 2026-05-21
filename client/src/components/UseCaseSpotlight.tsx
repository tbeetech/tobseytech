import { featuredUseCase } from "@/lib/usecase-config";
import { AlertCircle, Lightbulb, TrendingUp, Briefcase } from "lucide-react";

export default function UseCaseSpotlight() {
  const uc = featuredUseCase;

  return (
    <section className="py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-galactic-orange/40 text-galactic-orange text-xs font-orbitron">
            <span className="w-1.5 h-1.5 rounded-full bg-galactic-orange animate-pulse" />
            Use Case Spotlight · {uc.month}
          </span>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl overflow-hidden border-l-4 border-galactic-orange"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,130,70,0.08) 0%, rgba(34,130,70,0.04) 50%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 40px rgba(34,130,70,0.1)",
          }}
        >
          {/* Top accent band */}
          <div
            className="h-1 w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--galactic-orange), var(--galactic-gold), var(--galactic-green))",
            }}
          />

          <div className="p-6 sm:p-8 md:p-10">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Cover image */}
              {uc.coverImage && (
                <div className="lg:w-80 flex-shrink-0">
                  <img
                    src={uc.coverImage}
                    alt={uc.title}
                    loading="lazy"
                    className="w-full h-48 lg:h-full object-cover rounded-xl border border-galactic-orange/20"
                    style={{ aspectRatio: "4/3", maxHeight: "260px" }}
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="font-orbitron font-bold text-xl sm:text-2xl gradient-text mb-6">
                  {uc.title}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Problem */}
                  <div className="flex gap-3">
                    <div className="mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-galactic-red/10 text-galactic-red">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-orbitron text-galactic-orange/70 uppercase tracking-widest mb-1">
                        Problem
                      </p>
                      <p className="text-gray-200 text-sm leading-relaxed">{uc.problem}</p>
                    </div>
                  </div>

                  {/* Solution */}
                  <div className="flex gap-3">
                    <div className="mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-galactic-green/10 text-galactic-green">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-orbitron text-galactic-orange/70 uppercase tracking-widest mb-1">
                        Solution
                      </p>
                      <p className="text-gray-200 text-sm leading-relaxed">{uc.solution}</p>
                    </div>
                  </div>

                  {/* Facts / Results */}
                  <div className="flex gap-3">
                    <div className="mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-neon-yellow/10 text-neon-yellow">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-orbitron text-galactic-orange/70 uppercase tracking-widest mb-1">
                        Results
                      </p>
                      <p className="text-neon-yellow text-sm leading-relaxed font-semibold">
                        {uc.facts}
                      </p>
                    </div>
                  </div>

                  {/* Work Scope */}
                  <div className="flex gap-3">
                    <div className="mt-0.5 w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-neon-cyan/10 text-neon-cyan">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-orbitron text-galactic-orange/70 uppercase tracking-widest mb-1">
                        Scope of Work
                      </p>
                      <p className="text-neon-cyan text-sm leading-relaxed font-medium">
                        {uc.workScope}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
