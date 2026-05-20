import React from "react";

export default function CTASection() {
  return (
    <section className="py-12 px-6 bg-galactic-orange text-white text-center">
      <h2 className="text-xl md:text-2xl font-semibold mb-2 font-orbitron">
        Ready to Build Something That Works?
      </h2>
      <p className="text-sm opacity-80 mb-6 max-w-md mx-auto">
        Let's automate your workflow and scale your business with practical, AI-powered solutions.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-white text-galactic-orange rounded-lg font-semibold hover:bg-gray-100 transition-colors font-orbitron text-sm"
        >
          Book a Free Consultation
        </a>
        <a
          href="/services"
          className="inline-block px-6 py-3 border border-white/60 text-white rounded-lg font-medium hover:bg-white/10 transition-colors text-sm"
        >
          View Our Services
        </a>
      </div>
    </section>
  );
}
