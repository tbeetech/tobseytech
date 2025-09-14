import { useState } from "react";
import Navigation from "@/components/Navigation";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setStatus(res.ok ? "sent" : "error");
  };

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <section className="py-16 px-6 max-w-lg mx-auto">
        <h1 className="text-3xl font-semibold text-center mb-8">Contact Us</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-2 rounded bg-black border border-gray-700" name="name" placeholder="Name" required />
          <input className="w-full p-2 rounded bg-black border border-gray-700" name="company" placeholder="Company" />
          <input className="w-full p-2 rounded bg-black border border-gray-700" name="email" placeholder="Email" type="email" required />
          <select className="w-full p-2 rounded bg-black border border-gray-700" name="service">
            <option>AI Automation Systems</option>
            <option>Web & App Dev</option>
            <option>AI Marketing Systems</option>
            <option>Training & Upskilling</option>
          </select>
          <textarea className="w-full p-2 rounded bg-black border border-gray-700" name="message" placeholder="Message" rows={4} />
          <button type="submit" className="w-full bg-yellow-400 text-black py-2 rounded font-medium">Send</button>
          {status === "sent" && <p className="text-green-400">Message sent!</p>}
          {status === "error" && <p className="text-red-400">Something went wrong.</p>}
        </form>
      </section>
    </div>
  );
}
