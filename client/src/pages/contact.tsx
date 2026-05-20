import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Send, Mail, MessageCircle, CalendarDays } from "lucide-react";

const INQUIRY_TYPES = [
  "AI Automation Systems",
  "Web & App Development",
  "AI Integrations",
  "Branding & Identity",
  "Strategic Consulting",
  "Book a Demo / Consultation",
  "Partnership Inquiry",
  "General Question",
  "Custom Inquiry",
];

const CONTACT_EMAIL = "tobseytech@gmail.com";
const CALENDLY_URL = "https://calendly.com/tobseytech";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInquiry, setCustomInquiry] = useState("");
  const [selectedService, setSelectedService] = useState(INQUIRY_TYPES[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (selectedService === "Custom Inquiry" && customInquiry.trim()) {
      data.service = `Custom: ${customInquiry.trim()}`;
    } else {
      data.service = selectedService;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) form.reset();
    } catch {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 text-center mb-12">
          <h1 className="font-orbitron font-bold text-4xl gradient-text mb-4">Get In Touch</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Send us a message or book a call on our calendar. We respond within 24 hours.
          </p>
        </div>

        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-10 max-w-5xl">
          {/* Form */}
          <div className="glass-effect p-8 rounded-2xl">
            <h3 className="font-orbitron font-bold text-base text-neon-yellow mb-5">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-neon-yellow font-orbitron text-xs mb-2 uppercase tracking-wide">
                  Your Name *
                </label>
                <input
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-neon-yellow font-orbitron text-xs mb-2 uppercase tracking-wide">
                  Company
                </label>
                <input
                  name="company"
                  placeholder="Your Company (optional)"
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-neon-yellow font-orbitron text-xs mb-2 uppercase tracking-wide">
                  Email Address *
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-neon-yellow font-orbitron text-xs mb-2 uppercase tracking-wide">
                  Inquiry Type *
                </label>
                <select
                  name="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white text-sm"
                >
                  {INQUIRY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              {selectedService === "Custom Inquiry" && (
                <div>
                  <label className="block text-neon-yellow font-orbitron text-xs mb-2 uppercase tracking-wide">
                    Describe Your Inquiry *
                  </label>
                  <input
                    value={customInquiry}
                    onChange={(e) => setCustomInquiry(e.target.value)}
                    required
                    placeholder="Briefly describe what you need..."
                    className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-neon-yellow font-orbitron text-xs mb-2 uppercase tracking-wide">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell us about your project, goals, or questions..."
                  className="w-full px-4 py-2.5 rounded-lg bg-deep-space border border-galactic-orange/30 focus:border-galactic-orange focus:outline-none text-white placeholder-gray-500 text-sm resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-galactic-orange text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all font-orbitron text-sm disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
              {status === "sent" && (
                <p className="text-green-400 text-sm text-center">✓ Message received! We'll get back to you within 24 hours.</p>
              )}
              {status === "error" && (
                <p className="text-red-400 text-sm text-center">Something went wrong. Please try again or email us directly.</p>
              )}
            </form>
          </div>

          {/* Contact Info + Calendly */}
          <div className="flex flex-col justify-start space-y-8">
            {/* Calendly */}
            <div className="glass-effect p-6 rounded-2xl border border-galactic-green/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-galactic-green/20 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-5 h-5 text-galactic-green" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">Book a Call</p>
                  <p className="text-white text-sm font-semibold">Schedule via Calendly</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                Pick a time that works for you. 30-minute discovery calls to understand your project.
              </p>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-galactic-green/20 border border-galactic-green/40 rounded-lg text-galactic-green hover:bg-galactic-green/30 transition-colors font-orbitron text-sm"
              >
                <CalendarDays className="w-4 h-4" />
                Open Calendly
              </a>
            </div>

            <div>
              <h3 className="font-orbitron font-bold text-lg text-neon-yellow mb-4">Contact Details</h3>
              <div className="space-y-4">
                <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center shrink-0 group-hover:bg-galactic-orange/40 transition-colors">
                    <Mail className="w-5 h-5 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">Email</p>
                    <p className="text-gray-200 text-sm group-hover:text-neon-yellow transition-colors break-all">{CONTACT_EMAIL}</p>
                  </div>
                </a>
                <a href="https://wa.me/2348122536647" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center shrink-0 group-hover:bg-galactic-orange/40 transition-colors">
                    <MessageCircle className="w-5 h-5 text-neon-yellow" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-orbitron uppercase tracking-widest">WhatsApp</p>
                    <p className="text-gray-200 text-sm group-hover:text-neon-yellow transition-colors">Chat with us on WhatsApp</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="glass-effect p-5 rounded-xl border border-galactic-gold/20">
              <p className="text-gray-300 text-sm leading-relaxed">
                📍 Available for remote projects worldwide<br />
                ⏱ Typical response within <span className="text-neon-yellow font-semibold">24 hours</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
