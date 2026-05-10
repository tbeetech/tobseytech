import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  DatabaseZap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

interface AuditResult {
  total: number;
  cleaned: number;
  unchanged: number;
  errors: number;
}

export default function CleanerTab() {
  const { toast } = useToast();
  const [lastResult, setLastResult] = useState<AuditResult | null>(null);

  const auditMutation = useMutation<AuditResult>({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/bot/audit");
      const data = await res.json() as { ok: boolean } & AuditResult;
      return data;
    },
    onSuccess: (data) => {
      setLastResult(data);
      toast({
        title: `Audit complete — ${data.cleaned} post${data.cleaned !== 1 ? "s" : ""} cleaned`,
        description: `${data.total} total · ${data.unchanged} unchanged · ${data.errors} errors`,
      });
    },
    onError: () => {
      toast({
        title: "Audit failed",
        description: "Could not run the database audit. Check server logs.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">

      {/* ── Header card ── */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-galactic-orange/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-galactic-orange" />
          </div>
          <div>
            <h2 className="text-lg font-orbitron font-bold text-galactic-orange">
              Cleaner &amp; Corrector
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Mandatory sanitisation middleware between the news-fetching bot and the database
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="space-y-3 mb-6">
          <div className="flex gap-3 bg-space-dark rounded-xl p-4 border border-galactic-orange/10">
            <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-0.5">Synchronous Filter — The Gate</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Runs automatically on every "Fetch Now" action and scheduled bot cycle.
                Intercepts raw RSS data, strips stray HTML tags from title &amp; excerpt,
                decodes HTML entities (&amp;amp;, &amp;mdash;, &#x27;, …) and normalises
                whitespace before any post reaches the database.
              </p>
            </div>
          </div>

          <div className="flex gap-3 bg-space-dark rounded-xl p-4 border border-galactic-orange/10">
            <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <DatabaseZap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-0.5">Manual Audit — The Scanner</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Admin-triggered deep scan of every post already in the database.
                Retroactively fixes double-encoded entities, leftover HTML snippets,
                and typographic artifacts — updating only records that actually changed.
              </p>
            </div>
          </div>
        </div>

        {/* What the cleaner handles */}
        <div className="bg-space-dark rounded-xl p-4 border border-white/5 mb-6">
          <p className="text-galactic-orange text-xs font-orbitron font-bold mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Sanitisation rules applied
          </p>
          <ul className="text-gray-400 text-xs space-y-1 list-disc list-inside">
            <li>Strip raw HTML tags from <strong className="text-gray-300">title</strong> and <strong className="text-gray-300">excerpt</strong> fields</li>
            <li>Decode named entities: <code className="text-galactic-orange/80">&amp;amp;</code> → &amp;, <code className="text-galactic-orange/80">&amp;mdash;</code> → —, <code className="text-galactic-orange/80">&amp;hellip;</code> → …</li>
            <li>Decode numeric entities: <code className="text-galactic-orange/80">&amp;#160;</code> and <code className="text-galactic-orange/80">&amp;#x2019;</code></li>
            <li>Fix double-encoded entities in <strong className="text-gray-300">content</strong> HTML (<code className="text-galactic-orange/80">&amp;amp;amp;</code> → <code className="text-galactic-orange/80">&amp;amp;</code>)</li>
            <li>Replace typographic entities with real Unicode glyphs (—, –, …, ', ', ", ")</li>
            <li>Collapse excessive blank lines between block elements in content</li>
            <li>Normalise whitespace: trim leading/trailing spaces &amp; collapse runs</li>
          </ul>
        </div>

        {/* Run Audit button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => auditMutation.mutate()}
            disabled={auditMutation.isPending}
            className="bg-galactic-orange text-space-black font-orbitron text-xs hover:bg-galactic-gold shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] transition-all h-9"
          >
            {auditMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning…</>
            ) : (
              <><DatabaseZap className="w-4 h-4 mr-2" /> Run DB Audit</>
            )}
          </Button>
          {auditMutation.isPending && (
            <span className="text-gray-400 text-xs animate-pulse">
              Scanning all posts — this may take a moment…
            </span>
          )}
        </div>
      </div>

      {/* ── Audit result ── */}
      {lastResult && (
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-sm font-orbitron font-bold text-galactic-orange flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4" /> Last Audit Result
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Posts",  value: lastResult.total,     color: "text-white" },
              { label: "Cleaned",      value: lastResult.cleaned,    color: "text-green-400" },
              { label: "Unchanged",    value: lastResult.unchanged,  color: "text-blue-400" },
              { label: "Errors",       value: lastResult.errors,     color: "text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-space-dark rounded-xl p-4 text-center border border-white/5">
                <p className={`text-2xl font-orbitron font-bold ${color}`}>{value}</p>
                <p className="text-gray-500 text-[11px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {lastResult.errors > 0 && (
            <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                {lastResult.errors} post{lastResult.errors !== 1 ? "s" : ""} could not be cleaned.
                Check the server logs for details.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
