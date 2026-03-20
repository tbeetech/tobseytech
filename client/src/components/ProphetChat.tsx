import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const OPENING_LINES = [
  "PROPHET ONLINE. I am your navigation intelligence for this platform.",
  "Awaiting your directive. Ask me anything about TobseyTech.",
];

export default function ProphetChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: OPENING_LINES[0] + " " + OPENING_LINES[1] },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open, minimized]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/prophet", {
        messages: next.map(({ role, content }) => ({ role, content })),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      const errText =
        err?.message?.includes("503")
          ? "Prophet AI is offline — API key not configured."
          : "Signal lost. Try again.";
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

  return (
    <>
      {/* ── Trigger button — fixed below the nav bar ── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setOpen(true)}
            data-testid="prophet-chat-trigger"
            aria-label="Open Prophet AI"
            className="fixed z-40 flex items-center gap-2 cursor-pointer select-none"
            style={{ top: "76px", right: "18px" }}
          >
            {/* outer glow ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ background: "rgba(255,165,0,0.5)" }}
            />
            <span
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-full font-orbitron text-xs font-bold tracking-widest shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(20,16,8,0.97) 0%, rgba(40,30,5,0.97) 100%)",
                border: "1px solid rgba(255,165,0,0.55)",
                color: "var(--galactic-orange)",
                boxShadow: "0 0 18px rgba(255,165,0,0.25), inset 0 1px 0 rgba(255,215,0,0.08)",
              }}
            >
              {/* tactical icon */}
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
              top: "76px",
              right: "12px",
              width: "min(370px, calc(100vw - 24px))",
              maxHeight: minimized ? "44px" : "520px",
              background: "linear-gradient(160deg, rgba(14,11,4,0.98) 0%, rgba(26,20,6,0.98) 100%)",
              border: "1px solid rgba(255,165,0,0.4)",
              borderRadius: "10px",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,215,0,0.06), 0 0 32px rgba(255,165,0,0.08)",
              transition: "max-height 0.25s ease",
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-2.5 shrink-0 cursor-pointer select-none"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,165,0,0.12) 0%, rgba(255,165,0,0.04) 100%)",
                borderBottom: minimized ? "none" : "1px solid rgba(255,165,0,0.2)",
              }}
              onClick={() => setMinimized((v) => !v)}
            >
              <div className="flex items-center gap-2">
                {/* status dot */}
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
                  · NAVIGATION AI
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label={minimized ? "Expand Prophet" : "Minimize Prophet"}
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "var(--galactic-orange)" }}
                  onClick={(e) => { e.stopPropagation(); setMinimized((v) => !v); }}
                >
                  <ChevronDown
                    className="w-3.5 h-3.5 transition-transform"
                    style={{ transform: minimized ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                <button
                  aria-label="Close Prophet"
                  data-testid="prophet-chat-close"
                  className="p-1 rounded hover:bg-white/5 transition-colors"
                  style={{ color: "var(--galactic-orange)" }}
                  onClick={(e) => { e.stopPropagation(); setOpen(false); setMinimized(false); }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ── Classified banner ── */}
            {!minimized && (
              <div
                className="shrink-0 text-center font-orbitron text-[9px] tracking-[0.25em] py-1 opacity-40"
                style={{ color: "var(--galactic-gold)", borderBottom: "1px solid rgba(255,165,0,0.1)" }}
              >
                ▌ CLASSIFIED · LEVEL-3 SPARTAN · TOBSEYTECH ▐
              </div>
            )}

            {/* ── Messages ── */}
            {!minimized && (
              <div
                className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,165,0,0.3) transparent" }}
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
                              background: "rgba(255,165,0,0.07)",
                              border: "1px solid rgba(255,165,0,0.18)",
                              borderRadius: "2px 8px 8px 8px",
                              color: "rgba(255,255,255,0.88)",
                              fontFamily: "var(--font-sans)",
                            }
                          : {
                              background: "rgba(255,165,0,0.15)",
                              border: "1px solid rgba(255,165,0,0.35)",
                              borderRadius: "8px 2px 8px 8px",
                              color: "var(--galactic-gold)",
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
                      style={{ color: "var(--galactic-orange)", opacity: 0.7 }}
                    >
                      ◈
                    </span>
                    <div
                      className="flex items-center gap-1.5 px-3 py-2"
                      style={{
                        background: "rgba(255,165,0,0.07)",
                        border: "1px solid rgba(255,165,0,0.18)",
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
                <div ref={bottomRef} />
              </div>
            )}

            {/* ── Input bar ── */}
            {!minimized && (
              <div
                className="shrink-0 flex items-center gap-2 px-3 py-2.5"
                style={{ borderTop: "1px solid rgba(255,165,0,0.2)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Enter directive…"
                  maxLength={500}
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
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  data-testid="prophet-chat-send"
                  className="w-7 h-7 shrink-0"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, var(--galactic-orange), var(--galactic-gold))"
                      : "rgba(255,165,0,0.1)",
                    border: "1px solid rgba(255,165,0,0.35)",
                    borderRadius: "4px",
                    color: input.trim() ? "#000" : "rgba(255,165,0,0.3)",
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
