import React from "react";

export default function CTASection() {
  return (
    <section className="py-12 px-6 bg-neon-yellow text-black text-center">
      <h2 className="text-xl md:text-2xl font-semibold">
        Ready to Automate Your Workflow? Book a Free Consultation.
      </h2>
      <a
        href="/book-demo"
        className="inline-block mt-4 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
      >
        Book a Consultation
      </a>
    </section>
  );
}
