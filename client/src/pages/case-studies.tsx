import Navigation from "@/components/Navigation";

const cases = [
  { title: "Case Study 1", slug: "case-study-1" },
  { title: "Case Study 2", slug: "case-study-2" },
  { title: "Case Study 3", slug: "case-study-3" },
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
              <p className="mt-2 text-gray-400">Coming soon</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
