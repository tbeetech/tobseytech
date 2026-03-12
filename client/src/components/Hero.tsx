import React from "react";

export default function Hero() {
  return (
    <section className="w-full py-20 sm:py-24 px-4 sm:px-6 text-white bg-black">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-semibold leading-tight">
          Automate. Scale. Transform.
        </h1>
        <p className="mt-4 text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
          Empowering businesses with AI-powered automation, practical apps, and intelligent systems.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <a
            href="/book-demo"
            className="w-full sm:w-auto px-6 py-3 bg-neon-yellow text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors text-center"
          >
            Book a Consultation
          </a>
          <a
            href="/case-studies"
            className="w-full sm:w-auto px-6 py-3 border border-gray-600 rounded-lg font-medium hover:bg-gray-800 transition-colors text-center"
          >
            See Our Work
          </a>
        </div>
      </div>
    </section>
  );
}
