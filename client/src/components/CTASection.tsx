import React from "react";

export default function CTASection() {
  return (
    <section className="py-12 px-6 bg-yellow-400 text-black text-center">
      <h2 className="text-xl md:text-2xl font-semibold">
        Ready to Automate Your Business? Book a Free 20-Minute AI Audit.
      </h2>
      <a
        href="/book-demo"
        className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-lg font-medium"
      >
        Book a Demo
      </a>
    </section>
  );
}
