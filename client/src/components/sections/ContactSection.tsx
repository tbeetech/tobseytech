import { useState } from "react";
import { Mail, MessageCircle, Linkedin, Send } from "lucide-react";

const CONTACT_EMAIL = "tobseytech@gmail.com";

const INQUIRY_TYPES = [
  "AI Automation Systems",
  "Web & App Development",
  "AI Marketing Systems",
  "Training & Upskilling",
  "Book a Demo / Consultation",
  "Partnership Inquiry",
  "Investor Inquiry",
  "Career / Jobs",
  "General Question",
  "Custom Inquiry",
];

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle");
  const [selectedService, setSelectedService] = useState(INQUIRY_TYPES[0]);
  const [customInquiry, setCustomInquiry] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    if (!name || !email || !message) {
      alert("Please complete all fields before sending.");
      return;
    }

    const service = selectedService === "Custom Inquiry" && customInquiry.trim()
      ? `Custom: ${customInquiry.trim()}`
      : selectedService;

    setIsSubmitting(true);
    setSubmitState("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, service }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="page-section py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-orbitron font-bold text-2xl sm:text-3xl md:text-4xl mb-4 gradient-text">
            Get In Touch
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            Let's talk about your project. Send us a message directly, we'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 max-w-5xl mx-auto">
          {/* Contact form */}
          <div className="glass-effect p-6 sm:p-8 rounded-2xl">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="contact-name" className="block mb-2 text-neon-yellow font-orbitron text-sm">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block mb-2 text-neon-yellow font-orbitron text-sm">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="contact-service" className="block mb-2 text-neon-yellow font-orbitron text-sm">
                  Inquiry Type
                </label>
                <select
                  id="contact-service"
                  name="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white text-sm transition-colors"
                >
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {selectedService === "Custom Inquiry" && (
                <div>
                  <label htmlFor="custom-inquiry" className="block mb-2 text-neon-yellow font-orbitron text-sm">
                    Describe Your Inquiry
                  </label>
                  <input
                    id="custom-inquiry"
                    type="text"
                    value={customInquiry}
                    onChange={(e) => setCustomInquiry(e.target.value)}
                    required
                    placeholder="Briefly describe what you need..."
                    className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm transition-colors"
                  />
                </div>
              )}
              <div>
                <label htmlFor="contact-message" className="block mb-2 text-neon-yellow font-orbitron text-sm">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your project..."
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-neon-yellow text-black font-semibold rounded-lg hover:bg-yellow-400 active:scale-95 transition-all font-orbitron text-sm disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {submitState === "success" && (
                <p className="text-sm text-green-400">Message received. We will get back to you shortly.</p>
              )}
              {submitState === "error" && (
                <p className="text-sm text-red-400">Message could not be sent right now. Please try again.</p>
              )}
            </form>
          </div>

          {/* Contact details */}
          <div className="flex flex-col justify-center space-y-6 sm:space-y-8">
            <div>
              <h3 className="font-orbitron font-bold text-lg text-neon-yellow mb-4">Contact Details</h3>
              <div className="space-y-4">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center shrink-0 group-hover:bg-galactic-orange/40 transition-colors">
                    <Mail className="w-5 h-5 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">Email</p>
                    <p className="text-gray-200 text-sm group-hover:text-neon-yellow transition-colors break-all">
                      {CONTACT_EMAIL}
                    </p>
                  </div>
                </a>

                <a
                  href="https://wa.me/2348122536647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center shrink-0 group-hover:bg-galactic-orange/40 transition-colors">
                    <MessageCircle className="w-5 h-5 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">WhatsApp</p>
                    <p className="text-gray-200 text-sm group-hover:text-neon-yellow transition-colors">
                      Chat with us on WhatsApp
                    </p>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/oyebade-tobi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center shrink-0 group-hover:bg-galactic-orange/40 transition-colors">
                    <Linkedin className="w-5 h-5 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">LinkedIn</p>
                    <p className="text-gray-200 text-sm group-hover:text-neon-yellow transition-colors">
                      Connect on LinkedIn
                    </p>
                  </div>
                </a>
              </div>
            </div>

            <div className="glass-effect p-5 rounded-xl border border-galactic-gold/20">
              <p className="text-gray-300 text-sm leading-relaxed">
                📍 Based in Nigeria · Available for remote projects worldwide<br />
                ⏱ Typical response within <span className="text-neon-yellow font-semibold">24 hours</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

