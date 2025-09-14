import React from "react";
import PricingCard from "./PricingCard";

const packages = [
  // AI Automation Systems
  {
    title: "AI Automation Systems: Starter",
    price: "₦350k / $500 pm",
    features: ["Workflow automation", "Up to 2 processes", "Email support"],
    planId: "ai-automation-starter",
  },
  {
    title: "AI Automation Systems: Growth",
    price: "₦1.05m / $1,500 pm",
    features: ["Advanced automations", "Up to 5 processes", "Priority support"],
    planId: "ai-automation-growth",
  },
  {
    title: "AI Automation Systems: Enterprise",
    price: "₦2.8m / $4,000 pm",
    features: ["Custom workflows", "Unlimited processes", "Dedicated manager"],
    planId: "ai-automation-enterprise",
  },
  // Web & App Dev
  {
    title: "Web & App Dev: Basic",
    price: "₦1m / $1,500",
    features: ["Responsive website", "Basic CMS", "Email support"],
    planId: "web-app-basic",
  },
  {
    title: "Web & App Dev: Pro",
    price: "₦3.5m / $5,000",
    features: ["Custom design", "API integrations", "Analytics"],
    planId: "web-app-pro",
  },
  {
    title: "Web & App Dev: Elite",
    price: "₦7m / $10k+",
    features: ["Enterprise features", "Scalable architecture", "Ongoing support"],
    planId: "web-app-elite",
  },
  // AI Marketing Systems
  {
    title: "AI Marketing Systems: Launchpad",
    price: "₦525k / $750 pm",
    features: ["Campaign automation", "Analytics dashboard", "Email support"],
    planId: "ai-marketing-launchpad",
  },
  {
    title: "AI Marketing Systems: Momentum",
    price: "₦1.4m / $2k pm",
    features: ["Multi-channel funnels", "A/B testing", "Priority support"],
    planId: "ai-marketing-momentum",
  },
  {
    title: "AI Marketing Systems: Dominance",
    price: "₦2.1m / $3k pm",
    features: ["Advanced personalization", "Full-funnel analytics", "Dedicated strategist"],
    planId: "ai-marketing-dominance",
  },
  // Training & Upskilling
  {
    title: "Training & Upskilling: Intro",
    price: "₦1.4m / $2k",
    features: ["2-day workshop", "Resource library", "Certificate"],
    planId: "training-intro",
  },
  {
    title: "Training & Upskilling: Advanced",
    price: "₦3.5m / $5k",
    features: ["5-day intensive", "Project coaching", "Certificate"],
    planId: "training-advanced",
  },
  {
    title: "Training & Upskilling: Executive",
    price: "₦10.5m / $15k",
    features: ["Custom sessions", "Strategy roadmap", "Team training"],
    planId: "training-executive",
  },
];

export default function PricingGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {packages.map((p) => (
        <PricingCard key={p.planId} {...p} />
      ))}
    </div>
  );
}
