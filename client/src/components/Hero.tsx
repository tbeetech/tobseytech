import React from "react";

export default function Hero() {
  return (
    <section className="w-full py-16 px-6 text-white bg-black">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-semibold">
          AI-Powered Digital Solutions That Save Time & Scale Your Business
        </h1>
        <p className="mt-4 text-gray-300">
          We automate workflows for fintech, media, agriculture, healthcare,
          real estate, and e-commerce.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/book-demo" className="px-5 py-3 bg-yellow-400 text-black rounded-lg font-medium">
            Book a Demo
          </a>
          <a href="/pricing" className="px-5 py-3 border border-gray-600 rounded-lg font-medium">
            See Pricing
          </a>
        </div>
      </div>
    </section>
  );
}
