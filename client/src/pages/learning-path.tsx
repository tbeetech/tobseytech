import { useState } from "react";
import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, CheckCircle, RotateCcw, GraduationCap } from "lucide-react";

const questions = [
  {
    id: 1,
    question: "What is your primary business goal right now?",
    options: [
      { text: "Get more leads and customers", path: "marketing" },
      { text: "Automate repetitive tasks", path: "automation" },
      { text: "Build or improve my website/app", path: "web" },
      { text: "Grow my team's digital skills", path: "training" },
      { text: "Scale my existing operations", path: "consulting" },
    ],
  },
  {
    id: 2,
    question: "What best describes your technical background?",
    options: [
      { text: "Non-technical — I focus on strategy & people", path: "nontech" },
      { text: "Some tech knowledge, can use tools", path: "midtech" },
      { text: "Developer or engineer", path: "tech" },
      { text: "Designer or creative professional", path: "creative" },
    ],
  },
  {
    id: 3,
    question: "How urgent is your transformation need?",
    options: [
      { text: "Immediate — I need results in 30 days", path: "urgent" },
      { text: "Short-term — 3 to 6 months", path: "shortterm" },
      { text: "Long-term investment — 6 to 12 months", path: "longterm" },
    ],
  },
];

const pathRecommendations: Record<string, {
  title: string;
  description: string;
  courses: { name: string; duration: string; level: string }[];
  service: string;
  color: string;
}> = {
  "marketing-nontech-urgent": {
    title: "Digital Marketing Fast Track",
    description: "Get your business visible online fast. This path focuses on quick-win marketing strategies using no-code tools.",
    courses: [
      { name: "Social Media Mastery", duration: "2 hours", level: "Beginner" },
      { name: "Email Funnel Blueprint", duration: "3 hours", level: "Beginner" },
      { name: "Paid Ads in 48 Hours", duration: "4 hours", level: "Intermediate" },
    ],
    service: "Digital Marketing Package",
    color: "text-galactic-orange",
  },
  "automation-nontech-urgent": {
    title: "Automation Quick Start",
    description: "Deploy your first automation workflow this week with zero coding skills required.",
    courses: [
      { name: "No-Code Automation with Zapier", duration: "2 hours", level: "Beginner" },
      { name: "WhatsApp AI Setup Guide", duration: "1.5 hours", level: "Beginner" },
      { name: "CRM Pipeline Essentials", duration: "2 hours", level: "Beginner" },
    ],
    service: "Automation Systems Package",
    color: "text-neon-cyan",
  },
  default: {
    title: "Digital Transformation Bootcamp",
    description: "A comprehensive path covering all key aspects of digital transformation tailored to your business stage.",
    courses: [
      { name: "Digital Business Foundations", duration: "3 hours", level: "Beginner" },
      { name: "AI Tools for Business", duration: "4 hours", level: "Intermediate" },
      { name: "Data-Driven Decision Making", duration: "3 hours", level: "Intermediate" },
      { name: "Scale & Automate", duration: "5 hours", level: "Advanced" },
    ],
    service: "Strategic Consulting",
    color: "text-neon-yellow",
  },
};

export default function LearningPathPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (qId: number, path: string) => {
    const newAnswers = { ...answers, [qId]: path };
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setTimeout(() => setStep(s => s + 1), 300);
    } else {
      setTimeout(() => setShowResult(true), 300);
    }
  };

  const key = `${answers[1] || ""}-${answers[2] || ""}-${answers[3] || ""}`;
  const rec = pathRecommendations[key] || pathRecommendations.default;

  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>Learning Path Recommender – TOBSEYTECH</title>
      <Navigation />
      <main className="pt-24 pb-20 container mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-yellow/30 text-neon-yellow text-sm font-orbitron mb-4">
            <GraduationCap className="w-4 h-4" /> Feature 5 of 16
          </div>
          <h1 className="font-orbitron font-bold text-3xl md:text-5xl gradient-text mb-4">
            Learning Path Recommender
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Answer 3 quick questions and get a personalised learning roadmap with curated courses and services matched to your exact goals.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!showResult ? (
            <div className="glass-effect p-8 rounded-2xl border border-galactic-orange/20">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-orbitron text-gray-400 mb-2">
                  <span>Step {step + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-galactic-orange to-galactic-gold transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h2 className="font-orbitron text-xl text-white mb-6">{questions[step].question}</h2>

              <div className="space-y-3">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt.text}
                    onClick={() => handleAnswer(questions[step].id, opt.path)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 font-orbitron text-sm ${
                      answers[questions[step].id] === opt.path
                        ? "border-galactic-orange bg-galactic-orange/15 text-white"
                        : "border-white/10 hover:border-galactic-orange/40 text-gray-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {answers[questions[step].id] === opt.path ? (
                        <CheckCircle className="w-4 h-4 text-galactic-orange flex-shrink-0" />
                      ) : (
                        <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      )}
                      {opt.text}
                    </div>
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="mt-4 text-gray-500 hover:text-gray-300 font-orbitron text-xs transition-colors"
                >
                  ← Back
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`glass-effect p-8 rounded-2xl border border-galactic-orange/40`}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-galactic-orange/20 border-2 border-galactic-orange flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-galactic-orange" />
                  </div>
                  <p className="font-orbitron text-xs text-gray-500 mb-1">Your Recommended Path</p>
                  <h2 className={`font-orbitron font-black text-2xl ${rec.color} mb-2`}>{rec.title}</h2>
                  <p className="text-gray-300 text-sm max-w-md mx-auto leading-relaxed">{rec.description}</p>
                </div>

                <h3 className="font-orbitron text-sm text-neon-yellow mb-3">Recommended Courses</h3>
                <div className="space-y-3 mb-6">
                  {rec.courses.map((course, i) => (
                    <div key={course.name} className="flex items-center gap-4 p-3 rounded-xl border border-white/10 hover:border-galactic-orange/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-galactic-orange/20 flex items-center justify-center flex-shrink-0">
                        <span className="font-orbitron font-bold text-xs text-galactic-orange">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-orbitron text-sm text-white">{course.name}</p>
                        <p className="text-gray-500 text-xs">{course.duration} • {course.level}</p>
                      </div>
                      <span className="text-xs font-orbitron text-galactic-green border border-galactic-green/30 px-2 py-0.5 rounded-full">Free</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-galactic-orange/30 bg-galactic-orange/5 mb-6">
                  <p className="text-xs font-orbitron text-gray-400 mb-1">Recommended Service</p>
                  <p className="font-orbitron font-bold text-galactic-orange">{rec.service}</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={reset} variant="ghost" className="text-gray-400 font-orbitron text-xs flex-1">
                    <RotateCcw className="w-4 h-4 mr-1" /> Retake
                  </Button>
                  <Link href="/book-demo">
                    <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs flex-1">
                      Start My Journey
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
