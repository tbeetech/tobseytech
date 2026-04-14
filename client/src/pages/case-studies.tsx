import Navigation from "@/components/Navigation";
import { CheckCircle2, TrendingUp } from "lucide-react";

const cases = [
  {
    title: "Glow FM Content Repurposing Pipeline",
    slug: "glow-fm",
    category: "Media Automation",
    client: "Radio Station (Media House)",
    duration: "3 weeks",
    impact: "1 script → 10 posts in 30 seconds",
    metricValue: "95%",
    metricLabel: "Time Saved",
    overview:
      "A leading radio station needed to turn each broadcast script into platform-ready social-media posts across Twitter, Instagram, Facebook, LinkedIn, and WhatsApp — without hiring extra content staff.",
    solution:
      "Built a Python-based automation pipeline that ingests a broadcast script, uses an AI rewriting model to produce 10 distinct post formats tailored per platform, then pushes them to a content calendar and social scheduler automatically.",
    results: [
      "1 script → 10 posts in under 30 seconds",
      "95% reduction in content production time",
      "Zero additional headcount required",
      "Consistent brand voice across all channels",
    ],
    tech: ["Python", "OpenAI API", "Make (Integromat)", "Buffer API"],
  },
  {
    title: "Lead Sorting Automation",
    slug: "lead-sorting",
    category: "CRM & Sales Ops",
    client: "B2B Services Company",
    duration: "1 week",
    impact: "500+ leads organized monthly without manual effort",
    metricValue: "500+",
    metricLabel: "Leads/Month",
    overview:
      "The sales team was manually copying leads from Facebook Ads, Google Forms, and website inquiries into a spreadsheet — a 3-hour-per-day bottleneck.",
    solution:
      "Built a Zapier-based multi-source lead capture pipeline that routes, deduplicates, scores, and tags leads from 4 sources directly into HubSpot CRM with automatic follow-up task creation.",
    results: [
      "500+ leads processed monthly, fully automated",
      "Eliminated 3 hours of daily data-entry work",
      "Lead response time reduced from 48h to 2h",
      "Pipeline visibility improved — no leads dropped",
    ],
    tech: ["Zapier", "HubSpot CRM", "Google Sheets", "Meta Ads API"],
  },
  {
    title: "Invisphere Crypto & Assets Accreditation Portfolio Training Simulation Platform",
    slug: "invisphere",
    category: "FinTech & Blockchain",
    client: "Invisphere (invisphere.com)",
    duration: "8 weeks",
    impact: "Institutional-grade crypto training simulation with real-time market data",
    metricValue: "100%",
    metricLabel: "Real-Time Accuracy",
    overview:
      "Invisphere needed a professional cryptocurrency and digital assets accreditation platform that combines real-time market intelligence with portfolio training simulation — allowing users to practise trading, portfolio management, and investment strategy in a risk-free environment powered by live market data.",
    solution:
      "Designed and built a full-stack crypto investment and analytics platform featuring real-time market intelligence, automated analytics, portfolio tracking, and institutional-grade trading simulation tools. Users can practise buying, selling, and managing portfolios of Bitcoin, Ethereum, and top crypto assets with live price feeds, performance dashboards, and accreditation-ready progress tracking.",
    results: [
      "Real-time market data integration with live price feeds",
      "Comprehensive portfolio tracking and performance analytics",
      "Risk-free trading simulation mirroring real market conditions",
      "Institutional-grade analytics dashboard for informed decision-making",
    ],
    tech: ["React", "TypeScript", "Node.js", "Crypto Market APIs", "Real-Time WebSockets", "PostgreSQL"],
  },
  {
    title: "Digital Skills Training Cohort",
    slug: "skills-cohort",
    category: "Corporate Training",
    client: "Corporate Team (30+ employees)",
    duration: "4 weeks",
    impact: "30+ professionals upskilled in AI tools",
    metricValue: "30+",
    metricLabel: "Professionals Trained",
    overview:
      "A mid-sized company wanted to equip their team with practical AI and automation skills to improve departmental productivity without replacing existing staff.",
    solution:
      "Designed and delivered a 4-week blended learning program covering AI prompting, no-code automation, and data visualization — with live workshops, assignments, and a final capstone project.",
    results: [
      "30+ team members completed the program",
      "Measurable productivity improvements within 30 days",
      "5 internal automation tools built during the cohort",
      "NPS score of 9.1 / 10 from participants",
    ],
    tech: ["ChatGPT", "Make (Integromat)", "Notion", "Google Looker Studio"],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />

      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl mb-4 gradient-text">Case Studies</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Real systems, real results — proof over promises.
            </p>
          </div>

          <div className="space-y-16">
            {cases.map(({ title, slug, category, client, duration, impact, metricValue, metricLabel, overview, solution, results, tech }) => (
              <div
                key={slug}
                id={slug}
                className="glass-effect rounded-2xl border border-galactic-orange/20 overflow-hidden"
                data-testid={`case-study-detail-${slug}`}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-galactic-orange/10 to-galactic-gold/5 p-8 border-b border-galactic-orange/20">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="text-xs text-galactic-orange font-orbitron uppercase tracking-widest mb-2 block">
                        {category}
                      </span>
                      <h2 className="font-orbitron font-bold text-2xl md:text-3xl gradient-text mb-2">{title}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>Client: <span className="text-gray-300">{client}</span></span>
                        <span>Duration: <span className="text-gray-300">{duration}</span></span>
                      </div>
                    </div>
                    <div className="text-center bg-galactic-green/10 border border-galactic-green/30 rounded-xl px-6 py-4">
                      <div className="font-orbitron font-black text-3xl text-galactic-green">{metricValue}</div>
                      <div className="text-xs text-galactic-green font-orbitron">{metricLabel}</div>
                    </div>
                  </div>
                  <p className="mt-4 text-galactic-gold font-orbitron text-sm">"{impact}"</p>
                </div>

                {/* Body */}
                <div className="p-8 grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-orbitron font-bold text-neon-yellow mb-2">Challenge</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{overview}</p>
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-neon-yellow mb-2">Solution</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{solution}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-orbitron font-bold text-neon-yellow mb-3">Results</h3>
                      <ul className="space-y-2">
                        {results.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-sm text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-galactic-green shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-orbitron font-bold text-neon-yellow mb-2">Tech Stack</h3>
                      <div className="flex flex-wrap gap-2">
                        {tech.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-1 bg-galactic-orange/10 border border-galactic-orange/20 rounded text-xs font-orbitron text-galactic-orange"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold rounded-xl hover:shadow-[0_0_24px_rgba(255,165,0,0.4)] transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              Start Your Project
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

