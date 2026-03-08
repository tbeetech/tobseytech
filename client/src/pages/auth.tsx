import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Users, BookOpen, Heart } from "lucide-react";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate("/blog");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      navigate("/blog");
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      navigate("/blog");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
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
        style={{ background: "rgba(255,165,0,0.05)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ background: "rgba(0,212,255,0.04)", animationDelay: "1.5s" }}
      />
      <div className="absolute inset-0 starfield opacity-30 pointer-events-none" />

      {/* Left panel – brand showcase */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12 relative z-10">
        <div className="max-w-md">
          {/* Logo */}
          <div className="relative mb-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-galactic-orange via-galactic-gold to-galactic-orange flex items-center justify-center shadow-[0_0_50px_rgba(255,165,0,0.4)] animate-glow">
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

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl border border-galactic-orange/10 animate-slide-up"
                style={{
                  background: "rgba(255,165,0,0.05)",
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,165,0,0.15)" }}
                >
                  <Icon className="w-4 h-4 text-galactic-orange" />
                </div>
                <span className="text-white/80 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-600 text-xs mt-10">
            Join thousands of tech enthusiasts shaping the future
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="hidden lg:block w-px"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(255,165,0,0.2), transparent)" }}
      />

      {/* Right panel – auth form */}
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(255,165,0,0.4)]">
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
                      Username
                    </Label>
                    <Input
                      id="login-username"
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      required
                      className="h-10 border-galactic-orange/20 text-white text-sm"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="your_username"
                    />
                  </div>
                  <div className="space-y-1.5 input-glow">
                    <Label
                      htmlFor="login-password"
                      className="text-xs font-semibold text-galactic-orange/90 uppercase tracking-wide"
                    >
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      className="h-10 border-galactic-orange/20 text-white text-sm"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm transition-all mt-2 hover:shadow-[0_0_25px_rgba(255,165,0,0.4)]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In →"}
                  </Button>
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
                    <Input
                      id="reg-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      minLength={6}
                      className="h-10 border-galactic-orange/20 text-white text-sm"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-sm transition-all mt-2 hover:shadow-[0_0_25px_rgba(255,165,0,0.4)]"
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
