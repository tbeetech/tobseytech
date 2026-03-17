import { useState } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const tiers = [
  {
    name: "Starter",
    price: "$500",
    period: "/project",
    color: "text-gray-300",
    border: "border-white/20",
    highlight: false,
    features: [
      { text: "1 Service Vertical", included: true },
      { text: "Basic Automation Setup", included: true },
      { text: "Email Support", included: true },
      { text: "AI Integrations", included: false },
      { text: "Dedicated Strategist", included: false },
      { text: "Custom Analytics Dashboard", included: false },
      { text: "Monthly Strategy Calls", included: false },
      { text: "Priority Delivery", included: false },
    ],
  },
  {
    name: "Growth",
    price: "$1,500",
    period: "/month",
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    highlight: true,
    tag: "Most Popular",
    features: [
      { text: "3 Service Verticals", included: true },
      { text: "Advanced Automation Suite", included: true },
      { text: "Priority Support", included: true },
      { text: "AI Integrations", included: true },
      { text: "Dedicated Strategist", included: true },
      { text: "Custom Analytics Dashboard", included: false },
      { text: "Monthly Strategy Calls", included: false },
      { text: "Priority Delivery", included: false },
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    color: "text-galactic-gold",
    border: "border-galactic-gold",
    highlight: false,
    features: [
      { text: "All Service Verticals", included: true },
      { text: "Full Automation Ecosystem", included: true },
      { text: "24/7 Dedicated Support", included: true },
      { text: "AI Integrations", included: true },
      { text: "Dedicated Strategist", included: true },
      { text: "Custom Analytics Dashboard", included: true },
      { text: "Monthly Strategy Calls", included: true },
      { text: "Priority Delivery", included: true },
    ],
  },
];

export default function ServiceComparisonSection() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section id="service-comparison" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-cyan/30 text-neon-cyan text-sm font-orbitron mb-4">
            <ArrowRight className="w-4 h-4" /> Feature 9 of 16
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Service Comparison
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Choose the package that fits your growth stage. Every tier is designed to deliver measurable ROI from day one.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`glass-effect p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                tier.highlight
                  ? `${tier.border} ring-2 ring-galactic-orange/30 scale-105`
                  : selected === tier.name
                  ? `${tier.border}/60 ring-1 ring-galactic-orange/20`
                  : `${tier.border}/20 hover:${tier.border}/40`
              }`}
              onClick={() => setSelected(selected === tier.name ? null : tier.name)}
            >
              {tier.highlight && (
                <div className="text-center mb-3">
                  <span className="px-3 py-0.5 bg-galactic-orange/20 border border-galactic-orange/40 rounded-full text-galactic-orange text-xs font-orbitron">
                    {tier.tag}
                  </span>
                </div>
              )}
              <h3 className={`font-orbitron font-bold text-xl text-center ${tier.color} mb-1`}>{tier.name}</h3>
              <div className="text-center mb-5">
                <span className={`font-orbitron font-black text-3xl ${tier.color}`}>{tier.price}</span>
                {tier.period && <span className="text-gray-500 text-sm ml-1 font-orbitron">{tier.period}</span>}
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map(({ text, included }) => (
                  <li key={text} className="flex items-center gap-2 text-sm">
                    {included ? (
                      <Check className="w-4 h-4 text-galactic-green flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    )}
                    <span className={included ? "text-gray-200" : "text-gray-600"}>{text}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.name === "Enterprise" ? "/contact" : "/book-demo"}>
                <Button
                  className={`w-full font-orbitron text-xs ${
                    tier.highlight
                      ? "bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-bold"
                      : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
