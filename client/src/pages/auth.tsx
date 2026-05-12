import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Users, BookOpen, Heart, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, navigate] = useLocation();
  const search = useSearch();
  const { toast } = useToast();

  // Honour a ?redirect= param so deep-linked pages (e.g. /emailos) work after auth.
  // Security: only allow relative paths — must start with "/" and must not contain
  // backslashes, protocol separators ("//"), or other characters that could be used
  // to craft an open-redirect (e.g. "/\example.com", "/%2F...").
  const redirectTo = (() => {
    try {
      const params = new URLSearchParams(search);
      const r = params.get("redirect");
      if (
        r &&
        r.startsWith("/") &&
        !r.startsWith("//") &&
        !r.includes("\\") &&
        !r.includes("\n") &&
        !r.includes("\r") &&
        !/^\/[^/].*:/.test(r) // rule out "/foo:bar" style schemes
      ) {
        return r;
      }
    } catch { /* ignore */ }
    return "/blog";
  })();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Eye toggle states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  if (user) {
    navigate(redirectTo);
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      navigate(redirectTo);
    } catch (err: any) {
      toast({ title: "Login failed", description: getApiErrorMessage(err, "Invalid username or password. Please try again."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      setPasswordMismatch(true);
      toast({ title: "Passwords do not match", description: "Please make sure both password fields match.", variant: "destructive" });
      return;
    }
    setPasswordMismatch(false);
    setLoading(true);
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      navigate(redirectTo);
    } catch (err: any) {
      toast({ title: "Registration failed", description: getApiErrorMessage(err, "Could not create your account. Please try again."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: BookOpen, text: "Write & publish tech articles" },
    { icon: Heart, text: "Like, bookmark & save posts" },
    { icon: Users, text: "Comment & suggest edits" },
    { icon: Zap, text: "Real-time chat with community" },
  ];

  return (
    <div className="min-h-screen flex auth-bg relative overflow-hidden">
      {/* Animated background orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ background: "rgba(34,197,94,0.05)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ background: "rgba(0,212,255,0.04)", animationDelay: "1.5s" }}
      />
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />

      {/* Left panel – brand showcase */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 relative z-10">
        <div className="max-w-md">
          <div className="relative mb-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-galactic-orange via-galactic-gold to-galactic-orange flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-glow">
              <span className="text-space-black font-orbitron font-black text-3xl">TST</span>
            </div>
            <div className="absolute w-24 h-24 rounded-2xl border border-galactic-orange/30 scale-125 animate-pulse-slow" />
            <div
              className="absolute w-24 h-24 rounded-2xl border border-galactic-orange/15 scale-150 animate-pulse-slow"
              style={{ animationDelay: "0.5s" }}
            />
          </div>

          <h1 className="text-5xl font-orbitron font-black gradient-text text-center mb-3">
            TOBSEYTECH
          </h1>
          <p className="text-center text-galactic-gold/80 text-lg font-medium mb-12">
            Future Digital Solutions
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-galactic-orange/10 animate-slide-up"
                style={{
                  background: "rgba(34,197,94,0.05)",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}
                >
                  <Icon className="w-4 h-4 text-galactic-orange" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className="hidden lg:block w-px"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(34,197,94,0.2), transparent)" }}
      />

      {/* Right panel – auth form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <span className="text-space-black font-orbitron font-black text-xl">TST</span>
            </div>
            <h1 className="text-3xl font-orbitron font-black gradient-text">TOBSEYTECH</h1>
          </div>

          <div className="glass-effect-strong rounded-2xl p-7">
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6 rounded-xl p-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                <TabsTrigger
                  value="login"
                  className="font-orbitron text-xs rounded-lg data-[state=active]:bg-galactic-orange data-[state=active]:text-space-black"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="font-orbitron text-xs rounded-lg data-[state=active]:bg-galactic-orange data-[state=active]:text-space-black"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="login-username"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Username or Email
                    </Label>
                    <Input
                      id="login-username"
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      required
                      className="h-10 border-galactic-orange/20 text-white text-sm"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="your_username or you@example.com"
                    />
                  </div>
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="login-password"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                        className="h-10 border-galactic-orange/20 text-white text-sm pr-10"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-galactic-orange/60 hover:text-galactic-orange transition-colors"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm transition-all mt-2 hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In →"}
                  </Button>
                  <div className="text-center">
                    <a
                      href="/forgot-password"
                      className="text-galactic-orange/70 hover:text-galactic-orange text-xs"
                    >
                      Forgot password?
                    </a>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="reg-username"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Username
                    </Label>
                    <Input
                      id="reg-username"
                      type="text"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                      className="h-10 border-galactic-orange/20 text-white text-sm"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="your_username"
                    />
                  </div>
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="reg-email"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Email
                    </Label>
                    <Input
                      id="reg-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      className="h-10 border-galactic-orange/20 text-white text-sm"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="reg-password"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showRegPassword ? "text" : "password"}
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        required
                        minLength={6}
                        className="h-10 border-galactic-orange/20 text-white text-sm pr-10"
                        style={{ background: "rgba(0,0,0,0.6)" }}
                        placeholder="Min 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-galactic-orange/60 hover:text-galactic-orange transition-colors"
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="reg-confirm-password"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? "text" : "password"}
                        value={registerForm.confirmPassword}
                        onChange={(e) => {
                          setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                          setPasswordMismatch(false);
                        }}
                        required
                        minLength={6}
                        className={`h-10 border-galactic-orange/20 text-white text-sm pr-10 ${passwordMismatch ? "border-red-500" : ""}`}
                        style={{ background: "rgba(0,0,0,0.6)" }}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-galactic-orange/60 hover:text-galactic-orange transition-colors"
                        aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account →"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-gray-600 text-xs mt-5">
            TOBSEYTECH · Secure · Future · Innovative
          </p>
        </div>
      </div>
    </div>
  );
}

