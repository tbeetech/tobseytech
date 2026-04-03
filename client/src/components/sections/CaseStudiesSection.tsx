import { ArrowRight, ExternalLink, Smartphone } from "lucide-react";

const cases = [
  {
    title: "FebLuxury for Fashion Sales",
    category: "E-Commerce & Fashion",
    impact: "Full online store for luxury fashion brand",
    detail: "Designed and built an elegant, conversion-optimised e-commerce website for FebLuxury, enabling seamless product browsing, order management, and online sales for a premium fashion brand.",
    metric: "Sales-ready online store",
    slug: "febluxury-fashion-sales",
    link: null as string | null,
    linkType: "website" as "website" | "app",
  },
  {
    title: "Glow FM Radio Station Interactive Website",
    category: "Media & Broadcasting",
    impact: "Live streaming + listener engagement platform",
    detail: "Built a fully interactive website for Glow FM radio station featuring live stream integration, show schedules, presenters' profiles, and audience engagement tools — bringing the station online.",
    metric: "Full broadcast platform",
    slug: "glow-fm-website",
    link: "https://glowfmradio.com",
    linkType: "website" as "website" | "app",
  },
  {
    title: "Maktaris Herbals E-Commerce Store",
    category: "E-Commerce & Health",
    impact: "Online herbal products catalogue with ordering",
    detail: "Built an e-commerce website for Maktaris Herbals — featuring a product catalogue of chemical-free herbs, customer testimonials, easy payment flow, and fast delivery options for health-conscious buyers.",
    metric: "Full product storefront",
    slug: "maktaris-herbals",
    link: "https://maktaris.onrender.com",
    linkType: "website" as "website" | "app",
  },
  {
    title: "Compassionate Backers Financial Services Landing Page",
    category: "FinTech & Services",
    impact: "Professional financial services web presence",
    detail: "Designed and developed a professional landing page for Compassionate Backers — a financial services company offering loans, asset acquisition, and investment services, complete with service showcase and contact integration.",
    metric: "Service-ready landing page",
    slug: "compassionate-backers",
    link: "https://loan-landing-page.onrender.com",
    linkType: "website" as "website" | "app",
  },
  {
    title: "Cryptocurrency Simulation Profit & Trading Training Growth Website",
    category: "FinTech & Education",
    impact: "Real-time trading simulation for trainees",
    detail: "Developed an immersive crypto trading simulation and training website that lets users practise buying, selling, and portfolio management in a safe environment — tracking growth and profit metrics over time.",
    metric: "Hands-on trading training",
    slug: "crypto-trading-training",
    link: null as string | null,
    linkType: "website" as "website" | "app",
  },
  {
    title: "Glow FM Mobile Application",
    category: "Mobile Development",
    impact: "On-the-go listening for loyal audience",
    detail: "Created a dedicated mobile application for Glow FM, delivering live radio streaming, episode replays, news updates, and push notifications to thousands of listeners on Android and iOS.",
    metric: "Live mobile radio app",
    slug: "glow-fm-mobile-app",
    link: null as string | null,
    linkType: "app" as "website" | "app",
  },
  {
    title: "Social Media Management & Growth of Glow 99.1 FM",
    category: "Social Media & Growth",
    impact: "Consistent audience growth across platforms",
    detail: "Managed and grew Glow 99.1 FM's social media presence across Facebook, Instagram, and Twitter — developing content calendars, running engagement campaigns, and growing the station's digital audience significantly.",
    metric: "Multi-platform audience growth",
    slug: "glow-fm-social-media",
    link: null as string | null,
    linkType: "website" as "website" | "app",
  },
];

export default function CaseStudiesSection() {
  return (
    <section id="case-studies" className="page-section py-16 sm:py-20 bg-deep-space">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-4 gradient-text">
            Proof of Impact
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Real projects delivering measurable results across industries.
          </p>
        </div>
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map(({ title, category, detail, metric, slug, link, linkType }) => (
            <div
              key={slug}
              className="card"
              data-testid={`case-study-${slug}`}
            >
              <span className="text-xs text-galactic-orange font-orbitron uppercase tracking-widest mb-2 block">
                {category}
              </span>
              <h3 className="font-orbitron text-base sm:text-lg mb-2 text-neon-yellow">
                {title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{detail}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="px-3 py-1 bg-galactic-green/10 border border-galactic-green/30 rounded-full text-galactic-green text-xs font-orbitron">
                  {metric}
                </span>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 border border-galactic-orange/40 rounded-full text-galactic-orange hover:bg-galactic-orange/10 transition-colors text-xs font-orbitron"
                  >
                    {linkType === "app" ? (
                      <>Access <Smartphone className="w-3 h-3" /></>
                    ) : (
                      <>View <ExternalLink className="w-3 h-3" /></>
                    )}
                  </a>
                )}
              </div>
            </div>
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

