import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Navigation from "@/components/Navigation";
import SportaTab from "@/components/SportaTab";
import { Button } from "@/components/ui/button";
import { Loader2, Globe2, Zap } from "lucide-react";

export default function SportaPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-galactic-orange" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-space-black text-white">
        <Navigation />
        <div className="container mx-auto px-6 pt-36 text-center">
          <Globe2 className="w-16 h-16 text-galactic-orange mx-auto mb-6" />
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-4">SPORTA</h1>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            AI-powered social media aggregator &amp; publisher. Sign in to start automating your content.
          </p>
          <Link href="/auth">
            <Button className="bg-galactic-orange text-space-black font-orbitron hover:bg-galactic-gold">
              <Zap className="w-4 h-4 mr-2" /> Sign In to Access SPORTA
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-space-black text-white">
      <Navigation />
      <div className="container mx-auto px-6 pt-28 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Globe2 className="w-8 h-8 text-galactic-orange" />
            <h1 className="text-3xl font-orbitron font-bold gradient-text">SPORTA</h1>
          </div>
          <p className="text-gray-400">AI-powered social media aggregator &amp; publisher — your personal content engine</p>
        </div>
        <SportaTab />
      </div>
    </div>
  );
}
