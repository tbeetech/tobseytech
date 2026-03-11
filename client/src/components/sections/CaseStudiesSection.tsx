import { ArrowRight } from "lucide-react";

const cases = [
  {
    title: "Glow FM Content Repurposing Pipeline",
    category: "Media Automation",
    impact: "1 script → 10 posts in 30 seconds",
    detail: "Built a custom automation pipeline for a radio station that converts a single broadcast script into 10 formatted social-media posts across platforms — cutting content production time by 95%.",
    metric: "95% time saved",
    slug: "glow-fm",
  },
  {
    title: "SME WhatsApp Auto-Responder",
    category: "Customer Service AI",
    impact: "80% of customer queries answered instantly",
    detail: "Deployed an AI-powered WhatsApp bot for a small business that handles FAQs, order status, and appointment booking — freeing the owner from repetitive conversations 24/7.",
    metric: "80% query automation",
    slug: "whatsapp-auto-responder",
  },
  {
    title: "Lead Sorting Automation",
    category: "CRM & Sales Ops",
    impact: "500+ leads organized monthly without manual effort",
    detail: "Created a Zapier-powered lead pipeline that captures, scores, and routes 500+ monthly leads from multiple sources directly into a CRM, eliminating manual data entry.",
    metric: "500+ leads/month",
    slug: "lead-sorting",
  },
  {
    title: "E-Commerce Product Feed Sync",
    category: "Web Automation",
    impact: "Real-time inventory sync across 3 platforms",
    detail: "Automated product catalog updates across WooCommerce, Jumia, and Konga for a retail client — eliminating overselling and reducing update time from 4 hours to under 5 minutes.",
    metric: "99% sync accuracy",
    slug: "product-feed-sync",
  },
  {
    title: "Digital Skills Training Cohort",
    category: "Corporate Training",
    impact: "30+ participants upskilled in AI tools",
    detail: "Designed and delivered a 4-week cohort program on AI tools and no-code automation for a corporate team, resulting in measurable productivity improvements within 30 days.",
    metric: "30+ professionals trained",
    slug: "skills-cohort",
  },
];

export default function CaseStudiesSection() {
  return (
    <section id="case-studies" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Proof of Impact
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Real systems delivering measurable results across industries.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map(({ title, category, impact, detail, metric, slug }) => (
            <a
              key={slug}
              href={`/case-studies/${slug}`}
              className="card block group hover:border-galactic-orange/50 transition-colors"
              data-testid={`case-study-${slug}`}
            >
              <span className="text-xs text-galactic-orange font-orbitron uppercase tracking-widest mb-2 block">
                {category}
              </span>
              <h3 className="font-orbitron text-lg mb-2 text-neon-yellow group-hover:text-galactic-gold transition-colors">
                {title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{detail}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="px-3 py-1 bg-galactic-green/10 border border-galactic-green/30 rounded-full text-galactic-green text-xs font-orbitron">
                  {metric}
                </span>
                <ArrowRight className="w-4 h-4 text-galactic-orange group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/case-studies"
            className="inline-flex items-center gap-2 px-6 py-3 border border-galactic-orange/40 rounded-lg text-galactic-orange hover:bg-galactic-orange/10 transition-colors font-orbitron text-sm"
          >
            View All Case Studies <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

