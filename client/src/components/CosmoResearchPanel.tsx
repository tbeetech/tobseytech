import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ChevronDown, Telescope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, getApiErrorMessage } from "@/lib/queryClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE =
  "COSMO ONLINE. I am your academic research intelligence for cosmo-technology and political science. Ask me about space exploration, quantum tech, geopolitical patterns, or AI policy.";

const RESEARCH_TOPICS = [
  "Dark matter detection breakthroughs",
  "AI governance & space policy",
  "Quantum computing geopolitics",
  "Webb telescope discoveries",
  "Fusion energy & climate diplomacy",
  "Neuromorphic computing trends",
];

export default function CosmoResearchPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cycle through trending research topics on the trigger button
  useEffect(() => {
    const interval = setInterval(() => {
      setTopicIndex((i) => (i + 1) % RESEARCH_TOPICS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  async function sendMessage(text?: string) {
    const query = (text ?? input).trim();
    if (!query || loading) return;
    const userMsg: ChatMessage = { role: "user", content: query };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/cosmo", {
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      const errText = getApiErrorMessage(err, "Connection lost. Please try again.");
      setMessages([...next, { role: "assistant", content: `⚠ ${errText}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleTopicClick(topic: string) {
    sendMessage(topic);
  }

  return (
    <>
      {/* ── Trigger button, fixed bottom-left ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setOpen(true)}
            data-testid="cosmo-research-trigger"
            aria-label="Open Cosmo Research AI"
            className="fixed z-40 flex flex-col items-start gap-1 cursor-pointer select-none"
            style={{ bottom: "24px", left: "18px", maxWidth: "220px" }}
          >
            {/* outer glow ring */}
            <span
              className="absolute inset-0 rounded-xl animate-pulse opacity-20"
              style={{ background: "rgba(99,102,241,0.6)" }}
            />
            <span
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl font-orbitron text-xs font-bold tracking-widest shadow-lg w-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10,10,30,0.97) 0%, rgba(20,15,50,0.97) 100%)",
                border: "1px solid rgba(99,102,241,0.55)",
                color: "#a5b4fc",
                boxShadow:
                  "0 0 18px rgba(99,102,241,0.25), inset 0 1px 0 rgba(167,139,250,0.08)",
              }}
            >
              <Telescope className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              COSMO
            </span>
            {/* Cycling research topic */}
            <AnimatePresence mode="wait">
              <motion.span
                key={topicIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className="relative text-[9px] leading-tight px-2 truncate w-full"
                style={{
                  color: "rgba(165,180,252,0.65)",
                  fontFamily: "var(--font-orbitron)",
                  letterSpacing: "0.04em",
                }}
              >
                ↗ {RESEARCH_TOPICS[topicIndex]}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Research panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            data-testid="cosmo-research-panel"
            className="fixed z-40 flex flex-col overflow-hidden"
            style={{
              bottom: "24px",
              left: "12px",
              width: "min(390px, calc(100vw - 24px))",
              maxHeight: minimized ? "44px" : "560px",
              background:
                "linear-gradient(160deg, rgba(7,7,25,0.98) 0%, rgba(15,10,40,0.98) 100%)",
              border: "1px solid rgba(99,102,241,0.4)",
              borderRadius: "10px",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.75), 0 0 0 1px rgba(167,139,250,0.06), 0 0 32px rgba(99,102,241,0.1)",
              transition: "max-height 0.25s ease",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-2.5 shrink-0 cursor-pointer select-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0.04) 100%)",
                borderBottom: minimized
                  ? "none"
                  : "1px solid rgba(99,102,241,0.2)",
              }}
              onClick={() => setMinimized((v) => !v)}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{
                    background: "#818cf8",
                    boxShadow: "0 0 6px #818cf8",
                  }}
                />
                <span
                  className="font-orbitron font-bold text-xs tracking-widest"
                  style={{ color: "#a5b4fc" }}
                >
                  COSMO
                </span>
                <span
                  className="font-orbitron text-[10px] tracking-wider opacity-60"
                  style={{ color: "#c4b5fd" }}
                >
                  · RESEARCH AI
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={minimized ? "Expand Cosmo" : "Minimize Cosmo"}
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "#a5b4fc" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMinimized((v) => !v);
                  }}
                >
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{
                      transform: minimized
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>
                <button
                  aria-label="Close Cosmo Research"
                  data-testid="cosmo-research-close"
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "#a5b4fc" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    setMinimized(false);
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Academic classification banner ── */}
            {!minimized && (
              <div
                className="shrink-0 text-center font-orbitron text-[9px] tracking-[0.22em] py-1 opacity-40"
                style={{
                  color: "#c4b5fd",
                  borderBottom: "1px solid rgba(99,102,241,0.1)",
                }}
              >
                ✦ COSMO-TECH · POLITICAL RESEARCH · PATTERN RECOGNITION ✦
              </div>
            )}

            {/* ── Messages ── */}
            {!minimized && (
              <div
                className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(99,102,241,0.3) transparent",
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <span
                        className="mr-1.5 mt-0.5 shrink-0 font-orbitron text-[9px] font-bold tracking-wider self-start pt-1"
                        style={{ color: "#818cf8", opacity: 0.75 }}
                      >
                        ◎
                      </span>
                    )}
                    <div
                      className="max-w-[86%] px-3 py-2 text-xs leading-relaxed"
                      style={
                        msg.role === "assistant"
                          ? {
                              background: "rgba(99,102,241,0.08)",
                              border: "1px solid rgba(99,102,241,0.2)",
                              borderRadius: "2px 8px 8px 8px",
                              color: "rgba(255,255,255,0.88)",
                              fontFamily: "var(--font-sans)",
                              whiteSpace: "pre-wrap",
                            }
                          : {
                              background: "rgba(99,102,241,0.18)",
                              border: "1px solid rgba(99,102,241,0.4)",
                              borderRadius: "8px 2px 8px 8px",
                              color: "#c4b5fd",
                              fontFamily: "var(--font-orbitron)",
                              fontSize: "10px",
                              letterSpacing: "0.04em",
                            }
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start items-center gap-2">
                    <span
                      className="font-orbitron text-[9px] font-bold tracking-wider"
                      style={{ color: "#818cf8", opacity: 0.75 }}
                    >
                      ◎
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-2"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "2px 8px 8px 8px",
                      }}
                    >
                      <Loader2
                        className="w-3 h-3 animate-spin"
                        style={{ color: "#818cf8" }}
                      />
                      <span
                        className="font-orbitron text-[10px] tracking-widest opacity-70"
                        style={{ color: "#a5b4fc" }}
                      >
                        ANALYZING…
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}

            {/* ── Suggested research topics ── */}
            {!minimized && messages.length <= 1 && !loading && (
              <div
                className="shrink-0 px-3 pb-2 flex flex-wrap gap-1.5"
                style={{ borderTop: "1px solid rgba(99,102,241,0.12)" }}
              >
                <span
                  className="w-full font-orbitron text-[9px] tracking-widest opacity-40 pt-2 pb-0.5"
                  style={{ color: "#c4b5fd" }}
                >
                  TRENDING RESEARCH
                </span>
                {RESEARCH_TOPICS.slice(0, 4).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicClick(topic)}
                    className="text-[10px] px-2 py-0.5 rounded-full transition-colors hover:bg-indigo-500/20"
                    style={{
                      border: "1px solid rgba(99,102,241,0.3)",
                      color: "rgba(165,180,252,0.75)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input bar ── */}
            {!minimized && (
              <div
                className="shrink-0 flex items-center gap-2 px-3 py-2.5"
                style={{ borderTop: "1px solid rgba(99,102,241,0.2)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Enter research query…"
                  maxLength={600}
                  disabled={loading}
                  data-testid="cosmo-research-input"
                  className="flex-1 bg-transparent outline-none text-xs placeholder:opacity-30"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    color: "#c4b5fd",
                    letterSpacing: "0.04em",
                    caretColor: "#818cf8",
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  data-testid="cosmo-research-send"
                  className="w-7 h-7 shrink-0"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.35)",
                    borderRadius: "4px",
                    color: input.trim() ? "#fff" : "rgba(99,102,241,0.3)",
                  }}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

