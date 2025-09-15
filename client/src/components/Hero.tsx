import React from "react";

export default function Hero() {
  return (
    <section className="w-full py-24 px-6 text-white bg-black">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-6xl font-semibold">
          Automate. Scale. Transform.
        </h1>
        <p className="mt-4 text-gray-300 text-lg md:text-xl">
          Empowering businesses with AI-powered automation, practical apps, and intelligent systems.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a
            href="/book-demo"
            className="px-6 py-3 bg-neon-yellow text-black rounded-lg font-medium hover:bg-yellow-400"
          >
            Book a Consultation
          </a>
          <a
            href="/case-studies"
            className="px-6 py-3 border border-gray-600 rounded-lg font-medium hover:bg-gray-800"
          >
            See Our Work
          </a>
        </div>
      </div>
    </section>
  );
}
