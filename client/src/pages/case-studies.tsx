import Navigation from "@/components/Navigation";

const cases = [
  { title: "Glow FM Content Repurposing Pipeline", slug: "glow-fm" },
  { title: "SME WhatsApp Auto-Responder", slug: "whatsapp-auto-responder" },
  { title: "Lead Sorting Automation", slug: "lead-sorting" },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <section className="py-16 px-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-center">Case Studies</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {cases.map((c) => (
            <a
              key={c.slug}
              href={`/case-studies/${c.slug}`}
              className="border border-gray-800 p-6 rounded-lg hover:bg-gray-900"
            >
              <h3 className="text-xl">{c.title}</h3>
              <p className="mt-2 text-gray-400">Impact details coming soon</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
