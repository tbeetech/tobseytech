import { Twitter } from "lucide-react";

export default function FounderSection() {
  return (
    <section id="team" className="page-section py-16 sm:py-20 bg-deep-space">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-4 gradient-text">
            TOBSEYTECH VISIONARIES
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            The people building the products and driving every client's success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Founder card */}
          <div className="glass-effect p-6 sm:p-8 rounded-2xl border border-galactic-orange/30 flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center shrink-0">
                <span className="font-orbitron font-black text-white text-xl sm:text-2xl">OT</span>
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg sm:text-xl gradient-text">Oyebade Tobi</h3>
                <p className="text-galactic-orange text-sm font-orbitron">Founder & Lead Engineer</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed text-sm sm:text-base flex-1">
              Tech entrepreneur and digital engineer with deep experience in AI, automation, and building
              web and mobile products. Tobi leads the team and takes founder-level ownership on
              every project TOBSEYTECH handles — from the first call to the final delivery.
            </p>

            <a
              href="https://www.linkedin.com/in/oyebade-tobi/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2 bg-galactic-orange/10 border border-galactic-orange/30 rounded-lg text-galactic-orange hover:bg-galactic-orange/20 transition-colors font-orbitron text-sm w-fit"
              data-testid="founder-linkedin-link"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>

          {/* Co-founder card */}
          <div className="glass-effect p-6 sm:p-8 rounded-2xl border border-galactic-orange/30 flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center shrink-0">
                <span className="font-orbitron font-black text-white text-xl sm:text-2xl">OO</span>
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-lg sm:text-xl gradient-text">Seyi Olatunde</h3>
                <p className="text-galactic-orange text-sm font-orbitron">Co-Founder & Creative Director</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed text-sm sm:text-base flex-1">
              Motion graphics expert and visual storyteller with a sharp eye for brand identity.
              Seyi drives the creative side of TOBSEYTECH — turning ideas into powerful visuals,
              videos, and brand experiences that stick with audiences.
            </p>

            <a
              href="https://x.com/olatszn?s=21&t=L-ADV3vnwj8yn9qpMPNjVg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2 bg-galactic-orange/10 border border-galactic-orange/30 rounded-lg text-galactic-orange hover:bg-galactic-orange/20 transition-colors font-orbitron text-sm w-fit"
            >
              <Twitter className="w-4 h-4" />
              Follow on X
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
