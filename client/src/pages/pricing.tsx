import Navigation from "@/components/Navigation";
import PricingGrid from "@/components/PricingGrid";
import CTASection from "@/components/CTASection";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <section className="py-16 px-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-center">Pricing</h1>
        <div className="mt-8">
          <PricingGrid />
        </div>
      </section>
      <CTASection />
    </div>
  );
}
