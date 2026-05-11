import React from "react";
import DiscordIcon from "@/components/icons/DiscordIcon";
import { DISCORD_URL } from "@/constants/urls";

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
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Book a Free Consultation
        </a>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] text-white rounded-lg font-medium hover:bg-[#4752C4] transition-colors"
        >
          <DiscordIcon className="w-5 h-5" />
          Join Discord Community
        </a>
      </div>
    </section>
  );
}
