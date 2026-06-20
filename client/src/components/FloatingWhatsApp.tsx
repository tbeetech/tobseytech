import React from "react";

export default function FloatingWhatsApp() {
  const message = encodeURIComponent(
    "Hi ARCOLYTE TECHNOLOGIES, I'd like to learn more"
  );
  const href = `https://wa.me/2348122536647?text=${message}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg z-50"
    >
      WhatsApp
    </a>
  );
}
