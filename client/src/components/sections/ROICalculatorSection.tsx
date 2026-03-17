import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const serviceMultipliers: Record<string, { timeSaved: number; revenueBoost: number; costReduction: number }> = {
  automation: { timeSaved: 60, revenueBoost: 35, costReduction: 40 },
  ai: { timeSaved: 50, revenueBoost: 45, costReduction: 30 },
  web: { timeSaved: 20, revenueBoost: 55, costReduction: 15 },
  marketing: { timeSaved: 30, revenueBoost: 60, costReduction: 25 },
  consulting: { timeSaved: 25, revenueBoost: 40, costReduction: 20 },
};

export default function ROICalculatorSection() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [teamSize, setTeamSize] = useState(5);
  const [service, setService] = useState("automation");
  const [calculated, setCalculated] = useState(false);

  const mult = serviceMultipliers[service];
  const annualRevenue = monthlyRevenue * 12;
  const revenueGain = Math.round(annualRevenue * (mult.revenueBoost / 100));
  const costSavings = Math.round(teamSize * 2000 * (mult.costReduction / 100) * 12);
  const timeSavedHrs = Math.round(teamSize * 8 * (mult.timeSaved / 100) * 250);
  const totalROI = revenueGain + costSavings;

  return (
    <section id="roi-calculator" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-4">
            <Calculator className="w-4 h-4" /> Feature 1 of 16
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            ROI Calculator
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            See exactly how much value TOBSEYTECH services add to your business. Adjust the sliders and watch your returns grow in real time.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="glass-effect p-8 rounded-2xl border border-galactic-orange/20">
            <h3 className="font-orbitron text-lg text-neon-yellow mb-6">Your Business Inputs</h3>

            <div className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm font-orbitron mb-2 block">
                  Monthly Revenue: <span className="text-galactic-orange">${monthlyRevenue.toLocaleString()}</span>
                </label>
                <input
                  type="range" min={1000} max={500000} step={1000}
                  value={monthlyRevenue}
                  onChange={(e) => { setMonthlyRevenue(Number(e.target.value)); setCalculated(false); }}
                  className="w-full accent-galactic-orange"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>$1K</span><span>$500K</span>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-orbitron mb-2 block">
                  Team Size: <span className="text-galactic-orange">{teamSize} people</span>
                </label>
                <input
                  type="range" min={1} max={100} step={1}
                  value={teamSize}
                  onChange={(e) => { setTeamSize(Number(e.target.value)); setCalculated(false); }}
                  className="w-full accent-galactic-orange"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span><span>100</span>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm font-orbitron mb-2 block">Primary Service</label>
                <select
                  value={service}
                  onChange={(e) => { setService(e.target.value); setCalculated(false); }}
                  className="w-full bg-space-dark border border-galactic-orange/30 rounded-lg px-4 py-2.5 text-white font-orbitron text-sm focus:outline-none focus:border-galactic-orange"
                >
                  <option value="automation">Automation Systems</option>
                  <option value="ai">AI Integrations</option>
                  <option value="web">Web & App Development</option>
                  <option value="marketing">Digital Marketing</option>
                  <option value="consulting">Strategic Consulting</option>
                </select>
              </div>

              <Button
                onClick={() => setCalculated(true)}
                className="w-full bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold hover:shadow-[0_0_20px_rgba(255,165,0,0.4)] transition-all"
              >
                <Calculator className="w-4 h-4 mr-2" /> Calculate My ROI
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="glass-effect p-8 rounded-2xl border border-galactic-orange/20">
            <h3 className="font-orbitron text-lg text-neon-yellow mb-6">Projected Annual Impact</h3>

            <div className="space-y-5">
              {[
                { icon: TrendingUp, label: "Revenue Growth", value: `+$${revenueGain.toLocaleString()}`, color: "text-galactic-green", sub: `${mult.revenueBoost}% uplift from enhanced capabilities` },
                { icon: DollarSign, label: "Cost Savings", value: `+$${costSavings.toLocaleString()}`, color: "text-neon-cyan", sub: `${mult.costReduction}% reduction in operational costs` },
                { icon: Clock, label: "Hours Saved", value: `${timeSavedHrs.toLocaleString()} hrs`, color: "text-neon-yellow", sub: `${mult.timeSaved}% productivity boost per team member` },
              ].map(({ icon: Icon, label, value, color, sub }) => (
                <div key={label} className={`p-4 rounded-xl border transition-all duration-500 ${calculated ? "border-galactic-orange/40 bg-galactic-orange/5" : "border-white/5"}`}>
                  <div className="flex items-center gap-3 mb-1">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-gray-300 text-sm font-orbitron">{label}</span>
                  </div>
                  <div className={`font-orbitron font-black text-2xl ${color} transition-all duration-500 ${calculated ? "opacity-100" : "opacity-30"}`}>
                    {calculated ? value : "---"}
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{sub}</p>
                </div>
              ))}

              <div className={`p-5 rounded-xl border-2 transition-all duration-700 ${calculated ? "border-galactic-orange bg-galactic-orange/10" : "border-galactic-orange/20"}`}>
                <p className="text-gray-400 text-sm font-orbitron mb-1">Total Annual ROI</p>
                <div className={`font-orbitron font-black text-4xl gradient-text transition-all duration-700 ${calculated ? "opacity-100 scale-100" : "opacity-20 scale-95"}`}>
                  {calculated ? `$${totalROI.toLocaleString()}` : "$0"}
                </div>
                {calculated && (
                  <p className="text-galactic-green text-xs mt-2 font-orbitron">
                    ↑ {Math.round((totalROI / annualRevenue) * 100)}% return on investment
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link href="/book-demo">
            <Button size="lg" className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold px-8">
              Book a Demo & Unlock Your ROI
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
