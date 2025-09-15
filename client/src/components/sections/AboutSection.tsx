export default function AboutSection() {
  return (
    <section id="about" className="page-section py-20">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-6 gradient-text">
            Who We Are
          </h2>
          <p className="text-gray-300 mb-4">
            We are engineers focused on automation-first solutions. We partner with media houses, SMEs and industry to save time,
            cut costs and scale with real working systems. Our mission is proof over promises.
          </p>
          <ul className="space-y-2 text-gray-300">
            <li>• Accessibility</li>
            <li>• Reliability</li>
            <li>• Measurable impact</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
