import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }
    setPasswordMismatch(false);
    setLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err: any) {
      toast({ title: "Reset failed", description: getApiErrorMessage(err, "Could not reset your password. Please try again."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg relative overflow-hidden px-6">
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ background: "rgba(34,197,94,0.05)" }}
      />
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <span className="text-space-black font-orbitron font-black text-xl">TST</span>
          </div>
          <h1 className="text-3xl font-orbitron font-black gradient-text">ARCOLYTE TECHNOLOGIES</h1>
        </div>

        <div className="glass-effect-strong rounded-2xl p-7">
          {done ? (
            <div className="text-center space-y-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "rgba(34,197,94,0.15)" }}
              >
                <CheckCircle className="w-6 h-6 text-galactic-orange" />
              </div>
              <h2 className="text-white font-orbitron font-bold text-lg">Password Updated!</h2>
              <p className="text-white/60 text-sm">
                Your password has been reset. Redirecting to sign inâ€¦
              </p>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm mt-2">
                  Sign In â†’
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-orbitron font-bold text-lg mb-1">New Password</h2>
              <p className="text-white/50 text-xs mb-6">Choose a strong password for your account.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 input-glow">
                  <Label
                    htmlFor="new-password"
                    className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                  >
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-10 border-galactic-orange/20 text-white text-sm"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    placeholder="Min 6 characters"
                  />
                </div>
                <div className="space-y-1.5 input-glow">
                  <Label
                    htmlFor="confirm-new-password"
                    className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordMismatch(false);
                    }}
                    required
                    minLength={6}
                    className={`h-10 border-galactic-orange/20 text-white text-sm ${passwordMismatch ? "border-red-500" : ""}`}
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  />
                  {passwordMismatch && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm transition-all mt-2 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set New Password â†’"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
