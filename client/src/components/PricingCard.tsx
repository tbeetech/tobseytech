import React from "react";

type Props = {
  title: string;
  price: string;
  features: string[];
  planId: string;
};

export default function PricingCard({ title, price, features, planId }: Props) {
  return (
    <div className="rounded-2xl border border-gray-800 p-6 bg-black/60">
      <h3 className="text-xl text-white">{title}</h3>
      <p className="text-2xl text-yellow-400 mt-2">{price}</p>
      <ul className="mt-4 text-gray-300 space-y-2">
        {features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <a
        href={`/contact?plan=${encodeURIComponent(planId)}`}
        className="inline-block mt-6 px-4 py-2 bg-yellow-400 text-black rounded-lg font-medium"
      >
        Get Started
      </a>
    </div>
  );
}
