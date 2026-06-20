import { useState } from "react";
import { Trophy, Calendar, Users, ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const challenges = [
  {
    id: 1,
    title: "Automate Your Morning Routine",
    description: "Build a no-code automation that saves you at least 30 minutes every morning. Share your workflow and win recognition.",
    category: "Automation",
    difficulty: "Beginner",
    participants: 128,
    daysLeft: 12,
    prize: "ARCOLYTE TECHNOLOGIES Mentorship Session",
    color: "text-galactic-orange",
    border: "border-galactic-orange",
    bg: "bg-galactic-orange/10",
    hot: true,
  },
  {
    id: 2,
    title: "AI Prompt Engineering Sprint",
    description: "Write 5 business-grade prompts for customer service, marketing, HR, sales, and operations. Best set wins.",
    category: "AI",
    difficulty: "Intermediate",
    participants: 87,
    daysLeft: 5,
    prize: "Free Course Enrollment + Badge",
    color: "text-neon-cyan",
    border: "border-neon-cyan",
    bg: "bg-neon-cyan/10",
    hot: false,
  },
  {
    id: 3,
    title: "30-Second Product Demo Video",
    description: "Create the most compelling 30-second pitch for your product or service using only free tools. Community votes decide.",
    category: "Content",
    difficulty: "Beginner",
    participants: 203,
    daysLeft: 20,
    prize: "Featured on ARCOLYTE TECHNOLOGIES Showcase",
    color: "text-neon-yellow",
    border: "border-neon-yellow",
    bg: "bg-neon-yellow/10",
    hot: true,
  },
  {
    id: 4,
    title: "Data Dashboard in 48 Hours",
    description: "Turn raw business data into an interactive dashboard using any tool. Best design wins a strategic consulting call.",
    category: "Analytics",
    difficulty: "Advanced",
    participants: 44,
    daysLeft: 8,
    prize: "1:1 Strategy Session with Founder",
    color: "text-neon-purple",
    border: "border-neon-purple",
    bg: "bg-neon-purple/10",
    hot: false,
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "text-galactic-green bg-galactic-green/10 border-galactic-green/30",
  Intermediate: "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30",
  Advanced: "text-galactic-red bg-galactic-red/10 border-galactic-red/30",
};

export default function ChallengesSection() {
  const [joined, setJoined] = useState<number[]>([]);

  const handleJoin = (id: number) => {
    setJoined(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  return (
    <section id="challenges" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-galactic-orange/30 text-galactic-orange text-sm font-orbitron mb-4">
            <Trophy className="w-4 h-4" /> Feature 6 of 12
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Community Challenges
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Build real skills, compete for prizes, and get noticed by the ARCOLYTE TECHNOLOGIES network. New challenges every month.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {challenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`glass-effect p-6 rounded-2xl border ${challenge.border}/20 hover:${challenge.border}/40 transition-all group relative`}
            >
              {challenge.hot && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-0.5 bg-galactic-red/20 border border-galactic-red/30 rounded-full text-galactic-red text-xs font-orbitron">
                  <Flame className="w-3 h-3" /> HOT
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-orbitron px-2 py-0.5 rounded-full border ${difficultyColors[challenge.difficulty]}`}>
                  {challenge.difficulty}
                </span>
                <span className={`text-xs font-orbitron px-2 py-0.5 rounded-full border ${challenge.border}/20 ${challenge.color}`}>
                  {challenge.category}
                </span>
              </div>

              <h3 className={`font-orbitron font-bold text-base ${challenge.color} mb-2`}>{challenge.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{challenge.description}</p>

              <div className="p-3 rounded-lg bg-space-dark/60 mb-4">
                <p className="text-xs font-orbitron text-gray-500 mb-0.5">Prize</p>
                <p className="text-sm text-white font-orbitron">{challenge.prize}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 font-orbitron mb-4">
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {challenge.participants} participants</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {challenge.daysLeft} days left</span>
              </div>

              <Button
                onClick={() => handleJoin(challenge.id)}
                className={`w-full font-orbitron text-xs transition-all ${
                  joined.includes(challenge.id)
                    ? "bg-galactic-green/20 text-galactic-green border border-galactic-green/30"
                    : `bg-gradient-to-r from-galactic-orange/20 to-galactic-gold/20 text-white hover:from-galactic-orange/40 hover:to-galactic-gold/40 border ${challenge.border}/30`
                }`}
              >
                {joined.includes(challenge.id) ? "âœ“ Joined!" : "Join Challenge"} {!joined.includes(challenge.id) && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/auth">
            <Button size="lg" variant="outline" className="border-galactic-orange/40 text-galactic-orange hover:bg-galactic-orange/10 font-orbitron">
              Sign Up to Compete & Win
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
