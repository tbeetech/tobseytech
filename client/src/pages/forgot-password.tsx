import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err: any) {
      toast({ title: "Request failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg relative overflow-hidden px-6">
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ background: "rgba(255,165,0,0.05)" }}
      />
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(255,165,0,0.4)]">
            <span className="text-space-black font-orbitron font-black text-xl">TST</span>
          </div>
          <h1 className="text-3xl font-orbitron font-black gradient-text">TOBSEYTECH</h1>
        </div>

        <div className="glass-effect-strong rounded-2xl p-7">
          {submitted ? (
            <div className="text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(255,165,0,0.15)" }}
              >
                <Mail className="w-6 h-6 text-galactic-orange" />
              </div>
              <h2 className="text-white font-orbitron font-bold text-lg">Check your email</h2>
              <p className="text-white/60 text-sm">
                If that email is registered, a password reset link has been sent. Check your inbox
                (and spam folder).
              </p>
              <Link href="/auth">
                <Button
                  variant="ghost"
                  className="text-galactic-orange hover:text-galactic-gold text-sm mt-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-orbitron font-bold text-lg mb-1">Reset Password</h2>
              <p className="text-white/50 text-xs mb-6">
                Enter your account email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 input-glow">
                  <Label
                    htmlFor="reset-email"
                    className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 border-galactic-orange/20 text-white text-sm"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    placeholder="you@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm transition-all mt-2 hover:shadow-[0_0_25px_rgba(255,165,0,0.4)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link →"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/auth">
                  <button className="text-galactic-orange/70 hover:text-galactic-orange text-xs flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Sign In
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
