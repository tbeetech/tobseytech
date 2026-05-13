import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ChevronDown, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, getApiErrorMessage } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Inline markdown parser ────────────────────────────────────────────────────
function parseInline(text: string, baseKey: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buf = "";
  let i = 0;
  let k = 0;

  const flush = () => {
    if (buf) {
      nodes.push(<span key={`${baseKey}-t${k++}`}>{buf}</span>);
      buf = "";
    }
  };

  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        nodes.push(<strong key={`${baseKey}-b${k++}`}>{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1) {
        flush();
        nodes.push(<em key={`${baseKey}-i${k++}`}>{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        nodes.push(
          <code
            key={`${baseKey}-c${k++}`}
            style={{ background: "rgba(34,197,94,0.12)", borderRadius: "3px", padding: "0 3px", fontFamily: "monospace" }}
          >
            {text.slice(i + 1, end)}
          </code>
        );
        i = end + 1;
        continue;
      }
    }
    buf += text[i];
    i++;
  }
  flush();
  return nodes;
}

function formatProphetMessage(content: string): ReactNode {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, li) => {
        const trimmed = line.trimStart();

        if (trimmed === "") return <div key={li} className="h-1.5" />;

        // Headings
        if (trimmed.startsWith("### ")) {
          return (
            <p key={li} className="font-semibold mt-1.5 mb-0.5" style={{ color: "var(--galactic-gold)", fontSize: "11px" }}>
              {parseInline(trimmed.slice(4), `${li}`)}
            </p>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <p key={li} className="font-bold mt-2 mb-0.5" style={{ color: "var(--galactic-gold)", fontSize: "11px" }}>
              {parseInline(trimmed.slice(3), `${li}`)}
            </p>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <p key={li} className="font-bold mt-2 mb-1" style={{ color: "var(--galactic-gold)", fontSize: "12px" }}>
              {parseInline(trimmed.slice(2), `${li}`)}
            </p>
          );
        }

        // Bullet lists (- or *)
        const bulletMatch = trimmed.match(/^[-*]\s+(.*)/);
        if (bulletMatch) {
          return (
            <div key={li} className="flex gap-1.5 items-start ml-1">
              <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: "var(--galactic-orange)" }}>•</span>
              <span>{parseInline(bulletMatch[1], `${li}`)}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={li} className="flex gap-1.5 items-start ml-1">
              <span className="shrink-0 text-[10px]" style={{ color: "var(--galactic-orange)" }}>{numMatch[1]}.</span>
              <span>{parseInline(numMatch[2], `${li}`)}</span>
            </div>
          );
        }

        return (
          <p key={li} className={li > 0 ? "mt-0.5" : ""}>
            {parseInline(line, `${li}`)}
          </p>
        );
      })}
    </>
  );
}

const OPENING_LINES = [
  "PROPHET ONLINE. I'm your AI assistant — ask me anything.",
  "I can help with coding, research, analysis, creative writing, and much more.",
];

const ALL_STARTER_QUESTIONS = [
  "What services does TOBSEYTECH offer?",
  "How can AI automation help my business?",
  "What is SPORTA and how does it work?",
  "How do I get started with TOBSEYTECH?",
  "What makes TOBSEYTECH different from other agencies?",
  "Can you explain the Digital Maturity Assessment?",
  "How long does a typical project take?",
  "What industries does TOBSEYTECH work with?",
  "How much does web development cost?",
  "What AI tools do you use for clients?",
  "Tell me about Kingdom Enhancement Corp.",
  "How do I book a consultation?",
];

function pickRandomQuestions(n = 3): string[] {
  const shuffled = [...ALL_STARTER_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export default function ProphetChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: OPENING_LINES[0] + " " + OPENING_LINES[1] },
  ]);
  const [starterQuestions, setStarterQuestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: statusData, isLoading: statusLoading } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/prophet/status"],
    queryFn: async () => {
      const res = await fetch("/api/prophet/status");
      if (!res.ok) {
        console.error("[ProphetChat] Status check failed:", res.status);
        return { enabled: false };
      }
      return res.json();
    },
    refetchInterval: 10000,
  });

  const prophetEnabled = !statusLoading && statusData?.enabled === true;

  useEffect(() => {
    if (!prophetEnabled && open) {
      setOpen(false);
      setMinimized(false);
      setFullscreen(false);
    }
  }, [prophetEnabled, open]);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  // Pick random starter questions each time the chat opens
  useEffect(() => {
    if (open) {
      setStarterQuestions(pickRandomQuestions(3));
    }
  }, [open]);

  async function sendMessage(text?: string) {
    const msgText = (text ?? input).trim();
    if (!msgText || loading) return;
    const userMsg: ChatMessage = { role: "user", content: msgText };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStarterQuestions([]); // Hide starters after first message
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/prophet", {
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      const errText = getApiErrorMessage(err, "Signal lost. Try again.");
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

  function handleClose() {
    setOpen(false);
    setMinimized(false);
    setFullscreen(false);
  }

  function handleMinimize() {
    setMinimized((v) => !v);
  }

  return (
    <>
      {/* ── Trigger button ── */}
      <AnimatePresence>
        {!open && prophetEnabled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => { setOpen(true); setFullscreen(false); setMinimized(false); }}
            data-testid="prophet-chat-trigger"
            aria-label="Open Prophet AI"
            className="fixed z-40 flex items-center gap-2 cursor-pointer select-none"
            style={{ top: "76px", right: "18px" }}
          >
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ background: "rgba(34,197,94,0.5)" }}
            />
            <span
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-full font-orbitron text-xs font-bold tracking-widest shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(20,16,8,0.97) 0%, rgba(40,30,5,0.97) 100%)",
                border: "1px solid rgba(34,197,94,0.55)",
                color: "var(--galactic-orange)",
                boxShadow: "0 0 18px rgba(34,197,94,0.25), inset 0 1px 0 rgba(34,197,94,0.08)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
                aria-hidden="true"
              >
                <path d="M12 2a10 10 0 1 0 10 10" />
                <path d="M12 6v6l4 2" />
                <circle cx="20" cy="4" r="2" fill="currentColor" />
              </svg>
              PROPHET
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            data-testid="prophet-chat-panel"
            className="fixed z-40 flex flex-col overflow-hidden"
            style={{
              ...(fullscreen
                ? {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    maxHeight: minimized ? "44px" : "100%",
                    borderRadius: 0,
                  }
                : {
                    top: "76px",
                    right: "12px",
                    width: "min(420px, calc(100vw - 24px))",
                    maxHeight: minimized ? "44px" : "620px",
                    borderRadius: "10px",
                  }),
              background: "linear-gradient(160deg, rgba(14,11,4,0.98) 0%, rgba(26,20,6,0.98) 100%)",
              border: fullscreen ? "none" : "1px solid rgba(34,197,94,0.4)",
              boxShadow: fullscreen
                ? "none"
                : "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(34,197,94,0.06), 0 0 32px rgba(34,197,94,0.08)",
              transition: "max-height 0.25s ease",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-2.5 shrink-0 cursor-pointer select-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 100%)",
                borderBottom: minimized ? "none" : "1px solid rgba(34,197,94,0.2)",
              }}
              onClick={handleMinimize}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}
                />
                <span
                  className="font-orbitron font-bold text-xs tracking-widest"
                  style={{ color: "var(--galactic-orange)" }}
                >
                  PROPHET
                </span>
                <span
                  className="font-orbitron text-[10px] tracking-wider opacity-60"
                  style={{ color: "var(--galactic-gold)" }}
                >
                  · AI ASSISTANT
                </span>
              </div>
              <div className="flex items-center gap-1">
                {/* Fullscreen toggle */}
                <button
                  aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "var(--galactic-orange)" }}
                  onClick={(e) => { e.stopPropagation(); setFullscreen((v) => !v); }}
                >
                  {fullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
                {/* Minimize toggle */}
                <button
                  aria-label={minimized ? "Expand Prophet" : "Minimize Prophet"}
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "var(--galactic-orange)" }}
                  onClick={(e) => { e.stopPropagation(); handleMinimize(); }}
                >
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ transform: minimized ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {/* Close / X button */}
                <button
                  aria-label="Close Prophet"
                  data-testid="prophet-chat-close"
                  className="p-1 rounded hover:bg-red-500/20 transition-colors"
                  style={{ color: "var(--galactic-orange)" }}
                  onClick={(e) => { e.stopPropagation(); handleClose(); }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Classified banner ── */}
            {!minimized && (
              <div
                className="shrink-0 text-center font-orbitron text-[9px] tracking-[0.25em] py-1 opacity-40"
                style={{ color: "var(--galactic-gold)", borderBottom: "1px solid rgba(34,197,94,0.1)" }}
              >
                ▌ AGENTIC AI · POWERED BY GEMINI · TOBSEYTECH ▐
              </div>
            )}

            {/* ── Messages ── */}
            {!minimized && (
              <div
                className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(34,197,94,0.3) transparent" }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <span
                        className="mr-1.5 mt-0.5 shrink-0 font-orbitron text-[9px] font-bold tracking-wider self-start pt-1"
                        style={{ color: "var(--galactic-orange)", opacity: 0.7 }}
                      >
                        ◈
                      </span>
                    )}
                    <div
                      className="max-w-[85%] px-3 py-2 text-xs leading-relaxed"
                      style={
                        msg.role === "assistant"
                          ? {
                              background: "rgba(34,197,94,0.07)",
                              border: "1px solid rgba(34,197,94,0.18)",
                              borderRadius: "2px 8px 8px 8px",
                              color: "rgba(255,255,255,0.88)",
                              fontFamily: "var(--font-sans)",
                            }
                          : {
                              background: "rgba(34,197,94,0.15)",
                              border: "1px solid rgba(34,197,94,0.35)",
                              borderRadius: "8px 2px 8px 8px",
                              color: "var(--galactic-gold)",
                              fontFamily: "var(--font-orbitron)",
                              fontSize: "10px",
                              letterSpacing: "0.04em",
                            }
                      }
                    >
                      {msg.role === "assistant" ? formatProphetMessage(msg.content) : msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start items-center gap-2">
                    <span
                      className="font-orbitron text-[9px] font-bold tracking-wider"
                      style={{ color: "var(--galactic-orange)", opacity: 0.7 }}
                    >
                      ◈
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-2"
                      style={{
                        background: "rgba(34,197,94,0.07)",
                        border: "1px solid rgba(34,197,94,0.18)",
                        borderRadius: "2px 8px 8px 8px",
                      }}
                    >
                      <Loader2
                        className="w-3 h-3 animate-spin"
                        style={{ color: "var(--galactic-orange)" }}
                      />
                      <span
                        className="font-orbitron text-[10px] tracking-widest opacity-70"
                        style={{ color: "var(--galactic-orange)" }}
                      >
                        PROCESSING…
                      </span>
                    </div>
                  </div>
                )}

                {/* Starter questions */}
                {starterQuestions.length > 0 && !loading && (
                  <div className="flex flex-col gap-2 mt-1">
                    <p
                      className="font-orbitron text-[9px] tracking-widest opacity-50 pl-1"
                      style={{ color: "var(--galactic-gold)" }}
                    >
                      SUGGESTED QUESTIONS
                    </p>
                    {starterQuestions.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-left px-3 py-2 rounded-lg text-xs transition-colors"
                        style={{
                          background: "rgba(34,197,94,0.05)",
                          border: "1px solid rgba(34,197,94,0.2)",
                          color: "rgba(255,255,255,0.75)",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}

            {/* ── Input bar ── */}
            {!minimized && (
              <div
                className="shrink-0 flex items-center gap-2 px-3 py-2.5"
                style={{ borderTop: "1px solid rgba(34,197,94,0.2)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything…"
                  maxLength={2000}
                  disabled={loading}
                  data-testid="prophet-chat-input"
                  className="flex-1 bg-transparent outline-none text-xs placeholder:opacity-30"
                  style={{
                    fontFamily: "var(--font-orbitron)",
                    color: "var(--galactic-gold)",
                    letterSpacing: "0.05em",
                    caretColor: "var(--galactic-orange)",
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  data-testid="prophet-chat-send"
                  className="w-7 h-7 shrink-0"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, var(--galactic-orange), var(--galactic-gold))"
                      : "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.35)",
                    borderRadius: "4px",
                    color: input.trim() ? "#000" : "rgba(34,197,94,0.3)",
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

