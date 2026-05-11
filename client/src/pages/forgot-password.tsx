import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { apiRequest, getApiErrorMessage } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

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
      await apiRequest("POST", "/api/auth/forgot-password", { email, password });
      setDone(true);
      redirectTimer.current = setTimeout(() => navigate("/auth"), 3000);
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
          <h1 className="text-3xl font-orbitron font-black gradient-text">TOBSEYTECH</h1>
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
                Your password has been reset. Redirecting to sign in…
              </p>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm mt-2">
                  Sign In →
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-orbitron font-bold text-lg mb-1">Reset Password</h2>
              <p className="text-white/50 text-xs mb-6">
                Enter your email and choose a new password.
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
                <div className="space-y-1.5 input-glow">
                  <Label
                    htmlFor="new-password"
                    className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-10 border-galactic-orange/20 text-white text-sm pr-10"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="Min 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-galactic-orange/60 hover:text-galactic-orange transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 input-glow">
                  <Label
                    htmlFor="confirm-new-password"
                    className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-new-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordMismatch(false);
                      }}
                      required
                      minLength={6}
                      className={`h-10 border-galactic-orange/20 text-white text-sm pr-10${passwordMismatch ? " border-red-500" : ""}`}
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-galactic-orange/60 hover:text-galactic-orange transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordMismatch && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm transition-all mt-2 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password →"}
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

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

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
      await apiRequest("POST", "/api/auth/forgot-password", { email, password });
      setDone(true);
      redirectTimer.current = setTimeout(() => navigate("/auth"), 3000);
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
          <h1 className="text-3xl font-orbitron font-black gradient-text">TOBSEYTECH</h1>
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
                Your password has been reset. Redirecting to sign in…
              </p>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm mt-2">
                  Sign In →
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-white font-orbitron font-bold text-lg mb-1">Reset Password</h2>
              <p className="text-white/50 text-xs mb-6">
                Enter your email and choose a new password.
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
                    className={`h-10 border-galactic-orange/20 text-white text-sm${passwordMismatch ? " border-red-500" : ""}`}
                    style={{ background: "rgba(0,0,0,0.6)" }}
                    placeholder="••••••••"
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
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password →"}
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
