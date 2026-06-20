import { useState } from "react";
import { UserCheck, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const mentors = [
  {
    id: 1,
    name: "Tobi Oyebade",
    role: "Founder & CEO",
    expertise: ["AI Strategy", "Business Automation", "Startup Growth"],
    available: true,
    avatar: "TO",
    rating: 5.0,
    sessions: 120,
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    bg: "bg-galactic-orange",
    bio: "Built ARCOLYTE TECHNOLOGIES from zero to multi-service digital agency. Expert in automation-led growth for African SMEs.",
  },
  {
    id: 2,
    name: "Community Expert",
    role: "Web & App Architect",
    expertise: ["React", "Node.js", "Cloud Architecture"],
    available: true,
    avatar: "CE",
    rating: 4.9,
    sessions: 84,
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    bg: "bg-neon-cyan",
    bio: "Full-stack engineer with 8+ years building scalable platforms. Available for code reviews, system design, and career guidance.",
  },
  {
    id: 3,
    name: "Growth Advisor",
    role: "Digital Marketing Lead",
    expertise: ["Paid Ads", "Email Funnels", "Analytics"],
    available: false,
    avatar: "GA",
    rating: 4.8,
    sessions: 67,
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    bg: "bg-neon-yellow",
    bio: "Managed $500K+ in ad spend across Meta, Google, and TikTok. Specializes in data-driven marketing for B2B and B2C.",
  },
  {
    id: 4,
    name: "Brand Strategist",
    role: "Creative Director",
    expertise: ["Branding", "Visual Identity", "Storytelling"],
    available: true,
    avatar: "BS",
    rating: 4.9,
    sessions: 55,
    color: "text-neon-purple",
    border: "border-neon-purple",
    bg: "bg-neon-purple",
    bio: "Designed brand systems for 50+ startups. Passionate about helping founders build memorable, investor-ready brands.",
  },
];

export default function MentorshipSection() {
  const [requested, setRequested] = useState<number[]>([]);

  const handleRequest = (id: number) => {
    setRequested(prev => [...prev, id]);
  };

  return (
    <section id="mentorship" className="page-section py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-purple/30 text-neon-purple text-sm font-orbitron mb-4">
            <UserCheck className="w-4 h-4" /> Real-Time Feature
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Mentorship Network
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Connect with experienced digital practitioners who've been exactly where you are. Get personalised guidance, not generic advice.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className={`glass-effect p-6 rounded-2xl border ${mentor.border}/20 hover:${mentor.border}/40 transition-all group`}
            >
              {/* Avatar */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${mentor.bg}/20 border-2 ${mentor.border}/40 flex items-center justify-center flex-shrink-0`}>
                  <span className={`font-orbitron font-bold text-sm ${mentor.color}`}>{mentor.avatar}</span>
                </div>
                <div>
                  <p className="font-orbitron font-bold text-sm text-white">{mentor.name}</p>
                  <p className={`font-orbitron text-xs ${mentor.color}`}>{mentor.role}</p>
                </div>
              </div>

              {/* Rating & Sessions */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-neon-yellow fill-neon-yellow" />
                  <span className="font-orbitron text-xs text-neon-yellow">{mentor.rating}</span>
                </div>
                <span className="text-gray-500 text-xs">{mentor.sessions} sessions</span>
                <div className={`ml-auto px-2 py-0.5 rounded-full text-xs font-orbitron ${mentor.available ? "bg-galactic-green/10 text-galactic-green border border-galactic-green/30" : "bg-gray-800 text-gray-500 border border-gray-700"}`}>
                  {mentor.available ? "Available" : "Booked"}
                </div>
              </div>

              {/* Bio */}
              <p className="text-gray-400 text-xs leading-relaxed mb-3">{mentor.bio}</p>

              {/* Expertise tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {mentor.expertise.map(e => (
                  <span key={e} className={`text-xs px-2 py-0.5 rounded-full border ${mentor.border}/20 ${mentor.color} font-orbitron`}>
                    {e}
                  </span>
                ))}
              </div>

              <Button
                onClick={() => handleRequest(mentor.id)}
                disabled={!mentor.available && !requested.includes(mentor.id)}
                className={`w-full font-orbitron text-xs transition-all ${
                  requested.includes(mentor.id)
                    ? "bg-galactic-green/20 text-galactic-green border border-galactic-green/30"
                    : mentor.available
                    ? `bg-gradient-to-r from-galactic-orange/20 to-galactic-gold/20 text-white hover:from-galactic-orange/40 hover:to-galactic-gold/40 border ${mentor.border}/20`
                    : "bg-space-dark text-gray-600 border border-gray-700 cursor-not-allowed"
                }`}
              >
                {requested.includes(mentor.id)
                  ? "âœ“ Request Sent!"
                  : mentor.available
                  ? <><ArrowRight className="w-3.5 h-3.5 mr-1" /> Request Session</>
                  : "Currently Unavailable"
                }
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 glass-effect max-w-2xl mx-auto p-6 rounded-2xl border border-galactic-orange/20">
          <h3 className="font-orbitron font-bold text-white mb-2">Become a Mentor</h3>
          <p className="text-gray-400 text-sm mb-4">Share your expertise, build your personal brand, and earn while helping the community grow.</p>
          <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs">
            Apply to Mentor Program
          </Button>
        </div>
      </div>
    </section>
  );
}
