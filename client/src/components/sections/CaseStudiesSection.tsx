const cases = [
  {
    title: "Glow FM Content Repurposing Pipeline",
    impact: "1 script → 10 posts in 30 seconds.",
  },
  {
    title: "SME WhatsApp Auto-Responder",
    impact: "80% of customer queries answered instantly.",
  },
  {
    title: "Lead Sorting Automation",
    impact: "500+ leads organized monthly without manual effort.",
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
            Real systems delivering measurable results.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {cases.map(({ title, impact }) => (
            <a key={title} href="/case-studies" className="card block">
              <h3 className="font-orbitron text-xl mb-2 text-neon-yellow">{title}</h3>
              <p className="text-gray-300 text-sm">{impact}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
