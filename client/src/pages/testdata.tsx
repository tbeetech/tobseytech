import { useEffect, useState, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Database,
  Wifi,
  Clock,
  Server,
  AlertTriangle,
} from "lucide-react";

interface TestDataResult {
  ok: boolean;
  timestamp: string;
  database: {
    mongoUriConfigured: boolean;
    readyState: number;
    state: string;
    host: string | null;
    name: string | null;
  };
  ping: {
    ok: boolean;
    latencyMs: number | null;
    error: string | null;
  };
  collections: number | null;
}

type Status = "idle" | "loading" | "success" | "error";

export default function TestDataPage() {
  const [result, setResult] = useState<TestDataResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runTest = useCallback(async () => {
    setStatus("loading");
    setFetchError(null);
    try {
      const res = await fetch("/api/testdata");
      let data: TestDataResult;
      try {
        data = await res.json();
      } catch (parseErr) {
        // Server returned non-JSON (e.g. Vercel HTML error page)
        const detail = parseErr instanceof Error ? parseErr.message : String(parseErr);
        throw new Error(
          `Server responded with status ${res.status}: ${detail}`,
        );
      }
      setResult(data);
      setStatus(data.ok ? "success" : "error");
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Network error");
      setStatus("error");
      setResult(null);
    }
    setLastChecked(new Date());
  }, []);

  // Run on mount and every 30 seconds
  useEffect(() => {
    runTest();
    const interval = setInterval(runTest, 30_000);
    return () => clearInterval(interval);
  }, [runTest]);

  const isConnected = result?.ok === true;

  return (
    <div className="min-h-screen bg-space-black text-white">
      <title>Database Connectivity Test â€“ ARCOLYTE TECHNOLOGIES</title>
      <Navigation />

      <main className="pt-24 pb-16 container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-galactic-orange/10 border border-galactic-orange/30 mb-4">
            <Database className="w-8 h-8 text-galactic-orange" />
          </div>
          <h1 className="font-orbitron text-2xl font-bold text-galactic-orange tracking-wider mb-2">
            DATABASE CONNECTIVITY TEST
          </h1>
          <p className="text-white/50 text-sm">
            Live diagnostic for the MongoDB connection at{" "}
            <span className="text-galactic-orange/80 font-mono">ARCOLYTE TECHNOLOGIES.biz/testdata</span>
          </p>
        </div>

        {/* Status Banner */}
        <div
          className={`rounded-xl border p-4 mb-6 flex items-center gap-3 transition-colors ${
            status === "loading"
              ? "border-yellow-500/30 bg-yellow-500/5"
              : isConnected
              ? "border-green-500/30 bg-green-500/5"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          {status === "loading" ? (
            <Loader2 className="w-6 h-6 text-yellow-400 animate-spin shrink-0" />
          ) : isConnected ? (
            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
          )}
          <div>
            <p
              className={`font-orbitron text-sm font-semibold ${
                status === "loading"
                  ? "text-yellow-300"
                  : isConnected
                  ? "text-green-300"
                  : "text-red-300"
              }`}
            >
              {status === "loading"
                ? "Running connectivity testâ€¦"
                : isConnected
                ? "Database is CONNECTED"
                : "Database is UNREACHABLE"}
            </p>
            {lastChecked && (
              <p className="text-white/40 text-xs mt-0.5">
                Last checked: {lastChecked.toLocaleTimeString()} Â· automatically refreshes every 30s
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="ml-auto border-white/20 text-white/70 hover:bg-white/10 font-orbitron text-xs"
            onClick={runTest}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            {status === "loading" ? "" : "Re-test"}
          </Button>
        </div>

        {/* Error from fetch itself (network-level) */}
        {fetchError && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 mb-6 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Request failed</p>
              <p className="text-red-300/70 text-xs font-mono mt-1">{fetchError}</p>
            </div>
          </div>
        )}

        {/* Diagnostic cards */}
        {result && (
          <div className="grid gap-4">
            {/* Connection State */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-orbitron text-white/80 tracking-wider">
                  <Wifi className="w-4 h-4 text-galactic-orange" />
                  CONNECTION STATE
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/40 text-xs mb-1">State</p>
                  <Badge
                    variant="outline"
                    className={
                      result.database.state === "connected"
                        ? "border-green-500/50 text-green-300"
                        : "border-red-500/50 text-red-300"
                    }
                  >
                    {result.database.state}
                  </Badge>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Ready State Code</p>
                  <span className="font-mono text-white/80">{result.database.readyState}</span>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">MONGODB_URI set</p>
                  <Badge
                    variant="outline"
                    className={
                      result.database.mongoUriConfigured
                        ? "border-green-500/50 text-green-300"
                        : "border-red-500/50 text-red-300"
                    }
                  >
                    {result.database.mongoUriConfigured ? "yes" : "no"}
                  </Badge>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Collections</p>
                  <span className="font-mono text-white/80">
                    {result.collections !== null ? result.collections : ""}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Ping */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-orbitron text-white/80 tracking-wider">
                  <Clock className="w-4 h-4 text-galactic-orange" />
                  PING
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/40 text-xs mb-1">Result</p>
                  <Badge
                    variant="outline"
                    className={
                      result.ping.ok
                        ? "border-green-500/50 text-green-300"
                        : "border-red-500/50 text-red-300"
                    }
                  >
                    {result.ping.ok ? "OK" : "FAILED"}
                  </Badge>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Latency</p>
                  <span className="font-mono text-white/80">
                    {result.ping.latencyMs !== null ? `${result.ping.latencyMs} ms` : ""}
                  </span>
                </div>
                {result.ping.error && (
                  <div className="col-span-2">
                    <p className="text-white/40 text-xs mb-1">Error</p>
                    <p className="font-mono text-red-300 text-xs break-all">{result.ping.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Server info */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-sm font-orbitron text-white/80 tracking-wider">
                  <Server className="w-4 h-4 text-galactic-orange" />
                  SERVER INFO
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-white/40 text-xs mb-1">Host</p>
                  <span className="font-mono text-white/80 text-xs break-all">
                    {result.database.host ?? ""}
                  </span>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Database</p>
                  <span className="font-mono text-white/80 text-xs">
                    {result.database.name ?? ""}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-white/40 text-xs mb-1">Timestamp (server)</p>
                  <span className="font-mono text-white/60 text-xs">{result.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer hint */}
        <p className="text-white/25 text-xs text-center mt-8">
          This page is for diagnostic use only Â· No credentials are exposed
        </p>
      </main>
    </div>
  );
}
