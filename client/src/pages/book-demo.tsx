import Navigation from "@/components/Navigation";

const calendly = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com";

export default function BookDemoPage() {
  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="max-w-3xl mx-auto py-16 px-6">
        <iframe
          src={calendly}
          className="w-full h-[600px] border border-gray-800 rounded-lg"
        />
        <p className="mt-4 text-center">
          <a
            href={calendly}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-yellow-400"
          >
            Open in Calendly
          </a>
        </p>
      </div>
    </div>
  );
}
