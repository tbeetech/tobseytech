import React, { useState } from "react";

export default function LeadMagnetModal() {
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg max-w-sm w-full relative">
        <button
          onClick={() => setOpen(false)}
          className="absolute top-2 right-2 text-black"
        >
          ×
        </button>
        <h3 className="text-lg font-semibold">
          Get Our Free AI Efficiency Audit Guide (PDF)
        </h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full border p-2"
          />
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded"
          >
            Download
          </button>
        </form>
      </div>
    </div>
  );
}
