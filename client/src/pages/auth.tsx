import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
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
    if (registerForm.password !== registerForm.confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-space-black px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 starfield opacity-40 pointer-events-none" />
      <div className="absolute inset-0 galactic-grid opacity-10 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 border-2 border-galactic-orange rounded-full flex items-center justify-center bg-gradient-to-br from-galactic-orange to-galactic-gold mx-auto mb-4 shadow-[0_0_30px_rgba(255,165,0,0.5)]">
            <span className="text-space-black font-orbitron font-bold text-2xl">TST</span>
          </div>
          <h1 className="text-4xl font-orbitron font-bold gradient-text">TOBSEYTECH</h1>
          <p className="text-gray-400 mt-2">Join the future of tech</p>
        </div>

        <div className="glass-effect rounded-2xl p-8">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-space-dark rounded-xl">
              <TabsTrigger value="login" className="font-orbitron text-sm rounded-lg">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="font-orbitron text-sm rounded-lg">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="text-galactic-orange font-orbitron text-sm">
                    Username
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11"
                    placeholder="your_username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-galactic-orange font-orbitron text-sm">
                    Password
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11"
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold text-base shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reg-username" className="text-galactic-orange font-orbitron text-sm">
                    Username
                  </Label>
                  <Input
                    id="reg-username"
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                    required
                    className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11"
                    placeholder="your_username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-galactic-orange font-orbitron text-sm">
                    Email
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-galactic-orange font-orbitron text-sm">
                    Password
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    minLength={6}
                    className="bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password" className="text-galactic-orange font-orbitron text-sm">
                    Confirm Password
                  </Label>
                  <Input
                    id="reg-confirm-password"
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                      setPasswordMismatch(false);
                    }}
                    required
                    minLength={6}
                    className={`bg-space-dark border-galactic-orange/30 text-white focus:border-galactic-orange h-11 ${passwordMismatch ? "border-red-500" : ""}`}
                    placeholder="••••••••"
                  />
                  {passwordMismatch && (
                    <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold text-base shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          TOBSEYTECH · Future Digital Solutions
        </p>
      </div>
    </div>
  );
}
