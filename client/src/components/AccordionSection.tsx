import React from "react";

const solutions = [
  { title: "Radio/Media Automation", price: "₦2m–₦6m / $3k–$9k" },
  { title: "Healthcare Dashboards", price: "₦3.5m–₦10.5m / $5k–$15k" },
  { title: "Real Estate Lead Systems", price: "₦1.4m–₦4.2m / $2k–$6k" },
  { title: "Fintech AI Systems", price: "₦5m–₦15m / $7k–$20k" },
  { title: "Agritech Platforms", price: "₦3m–₦10m / $4.5k–$14k" },
  { title: "E-commerce & Retail AI", price: "₦2.5m–₦8m / $3.5k–$11k" },
];

export default function AccordionSection() {
  return (
    <section className="py-16 px-6 text-white bg-space-black">
      <h2 className="text-2xl font-semibold text-center mb-8">
        Specialized Solutions
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {solutions.map((s) => (
          <details key={s.title} className="border border-gray-800 rounded-lg p-4">
            <summary className="cursor-pointer font-medium">
              {s.title} <span className="text-yellow-400">({s.price})</span>
            </summary>
            <p className="mt-2 text-gray-300">
              Custom {s.title.toLowerCase()} tailored to your needs.
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
