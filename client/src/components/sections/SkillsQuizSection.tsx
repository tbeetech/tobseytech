import { useState } from "react";
import { Brain, CheckCircle, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const questions = [
  {
    id: 1,
    question: "How do you currently handle lead management?",
    options: [
      { text: "Spreadsheets / manual tracking", score: 1 },
      { text: "Basic CRM (e.g., HubSpot free)", score: 2 },
      { text: "Automated pipelines with workflows", score: 3 },
      { text: "AI-powered smart routing & scoring", score: 4 },
    ],
  },
  {
    id: 2,
    question: "What best describes your content production process?",
    options: [
      { text: "I write everything manually", score: 1 },
      { text: "I use templates but still mostly manual", score: 2 },
      { text: "I use AI tools for drafts", score: 3 },
      { text: "Fully automated multi-channel distribution", score: 4 },
    ],
  },
  {
    id: 3,
    question: "How does your team handle customer support?",
    options: [
      { text: "Manual responses only", score: 1 },
      { text: "FAQ page + email", score: 2 },
      { text: "Chatbot with basic rules", score: 3 },
      { text: "AI assistant handling 80%+ of queries", score: 4 },
    ],
  },
  {
    id: 4,
    question: "How often do you analyze business data?",
    options: [
      { text: "Rarely / when there's a problem", score: 1 },
      { text: "Monthly reports", score: 2 },
      { text: "Weekly dashboards", score: 3 },
      { text: "Real-time analytics with alerts", score: 4 },
    ],
  },
];

const levels = [
  { min: 4, max: 6, title: "Digital Beginner", color: "text-galactic-red", bg: "bg-galactic-red/10", desc: "You're at the starting line, great news! There's enormous untapped potential in your business. TOBSEYTECH can automate your core workflows and rapidly modernize your operations.", recommendation: "Start with Automation Systems" },
  { min: 7, max: 10, title: "Growing Digital", color: "text-galactic-orange", bg: "bg-galactic-orange/10", desc: "You've started your digital journey but there are clear gaps. With the right AI integrations and smarter tooling, you could 3x your output without adding headcount.", recommendation: "Explore AI Integrations + Digital Marketing" },
  { min: 11, max: 13, title: "Tech-Forward", color: "text-neon-yellow", bg: "bg-neon-yellow/10", desc: "You're ahead of most businesses! Now it's about optimizing, scaling, and turning your digital capabilities into a competitive moat.", recommendation: "Level up with Strategic Consulting" },
  { min: 14, max: 16, title: "Digital Leader", color: "text-galactic-green", bg: "bg-galactic-green/10", desc: "You're operating at an elite level. TOBSEYTECH can partner with you on advanced AI systems, corporate training programs, and expansion consulting.", recommendation: "Partner with us on Enterprise Solutions" },
];

export default function SkillsQuizSection() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [current, setCurrent] = useState(0);
  const { user } = useAuth();

  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const level = levels.find(l => totalScore >= l.min && totalScore <= l.max) || levels[0];
  const progress = (Object.keys(answers).length / questions.length) * 100;

  const handleAnswer = (qId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [qId]: score }));
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(c => c + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === questions.length) {
      setSubmitted(true);
      if (user) {
        fetch("/api/profile/feature-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feature: "skills-quiz", score: totalScore, level: level.title }),
        }).catch((err) => console.warn("[SkillsQuiz] Could not save result to profile:", err));
      }
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
  };

  return (
    <section id="skills-quiz" className="page-section py-20 bg-deep-space">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neon-yellow/30 text-neon-yellow text-sm font-orbitron mb-4">
            <Brain className="w-4 h-4" /> Feature 3 of 12
          </div>
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 gradient-text">
            Digital Skills Assessment
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Answer 4 quick questions to benchmark your business's digital maturity and get a personalised roadmap.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {!submitted ? (
            <div className="glass-effect p-8 rounded-2xl border border-galactic-orange/20">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-orbitron text-gray-400 mb-2">
                  <span>Question {Math.min(current + 1, questions.length)} of {questions.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-2 bg-space-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-galactic-orange to-galactic-gold transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h3 className="font-orbitron text-lg text-white mb-4">
                  {questions[current].question}
                </h3>
                <div className="space-y-3">
                  {questions[current].options.map((opt) => {
                    const selected = answers[questions[current].id] === opt.score;
                    return (
                      <button
                        key={opt.text}
                        onClick={() => handleAnswer(questions[current].id, opt.score)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 font-orbitron text-sm ${
                          selected
                            ? "border-galactic-orange bg-galactic-orange/15 text-white"
                            : "border-white/10 hover:border-galactic-orange/40 text-gray-300 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {selected ? (
                            <CheckCircle className="w-4 h-4 text-galactic-orange flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                          )}
                          {opt.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3 justify-between">
                <Button
                  variant="ghost"
                  onClick={() => setCurrent(c => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="text-gray-400 font-orbitron text-xs"
                >
                  Back
                </Button>
                <div className="flex gap-3">
                  {current < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrent(c => c + 1)}
                      disabled={!answers[questions[current].id]}
                      className="bg-galactic-orange/20 text-galactic-orange hover:bg-galactic-orange/30 font-orbitron text-xs"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={Object.keys(answers).length < questions.length}
                      className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs"
                    >
                      Get My Results
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`glass-effect p-8 rounded-2xl border border-galactic-orange/40 ${level.bg}`}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-galactic-orange/20 border-2 border-galactic-orange flex items-center justify-center mx-auto mb-4">
                  <Brain className={`w-8 h-8 ${level.color}`} />
                </div>
                <p className="text-gray-400 text-sm font-orbitron mb-1">Your Digital Maturity Level</p>
                <h3 className={`font-orbitron font-black text-3xl ${level.color} mb-2`}>{level.title}</h3>
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-10 rounded-full transition-colors ${i < levels.indexOf(level) + 1 ? "bg-galactic-orange" : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto">{level.desc}</p>
              </div>

              <div className="p-4 rounded-xl border border-galactic-orange/30 bg-galactic-orange/5 mb-6 overflow-hidden">
                <p className="text-xs font-orbitron text-gray-400 mb-1">Recommended Next Step</p>
                <p className="text-galactic-orange font-orbitron font-bold break-words">{level.recommendation}</p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="text-gray-400 font-orbitron text-xs"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Retake Quiz
                </Button>
                <Button
                  onClick={() => window.location.href = "/contact"}
                  className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs"
                >
                  Get a Free Consultation
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
