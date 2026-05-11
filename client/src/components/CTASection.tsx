import React from "react";

export default function CTASection() {
  return (
    <section className="py-12 px-6 bg-neon-yellow text-black text-center">
      <p className="text-xs font-orbitron font-bold tracking-widest mb-1 opacity-60">KINGDOM ENHANCEMENT CORP</p>
      <h2 className="text-xl md:text-2xl font-semibold mb-1">
        Ready to Build Something Kingdom-Aligned?
      </h2>
      <p className="text-sm opacity-70 mb-4 max-w-md mx-auto">
        Let's automate your workflow, enhance your church's digital presence, and scale with purpose — in real time.
      </p>
      <a
        href="/contact"
        className="inline-block mt-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
      >
        Book a Free Consultation
      </a>
    </section>
  );
}
