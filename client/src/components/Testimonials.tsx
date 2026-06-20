import React from "react";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    quote: "ARCOLYTE TECHNOLOGIES transformed our processes and saved us countless hours.",
    author: "Client A",
  },
  {
    quote: "Their team delivered beyond expectations.",
    author: "Client B",
  },
  {
    quote: "We scaled our business thanks to their AI solutions.",
    author: "Client C",
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 px-6 bg-black text-white">
      <h2 className="text-2xl font-semibold text-center mb-8">Testimonials</h2>
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <TestimonialCard key={t.author} {...t} />
        ))}
      </div>
    </section>
  );
}
