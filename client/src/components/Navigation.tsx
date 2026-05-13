import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User, MessageCircle, LayoutDashboard, Globe2, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import NotificationBell from "@/components/NotificationBell";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { id: "services", label: "Services" },
    { id: "case-studies", label: "Case Studies" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];


  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 military-nav ${isScrolled ? "backdrop-blur-xl" : ""}`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer" data-testid="nav-logo">
              <img
                src="https://i.pinimg.com/1200x/58/b9/9e/58b99ee7bfbbf7c0043a1950be716265.jpg"
                alt="TOBSEYTECH Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-[0_0_16px_rgba(34,197,94,0.35)]"
              />
              <span className="font-orbitron font-bold text-lg gradient-text">TOBSEYTECH</span>
            </div>
          </Link>

          {/* Gradient separator (desktop only) */}
          <div
            className="hidden md:block h-6 w-px mx-4"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(34,197,94,0.3), transparent)" }}
          />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6 flex-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors"
                data-testid={`nav-link-${link.id}`}
              >
                {link.label}
              </button>
            ))}
            <Link href="/blog">
              <button className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors">
                Blog
              </button>
            </Link>
            <Link href="/sporta">
              <button className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors flex items-center gap-1">
                <Globe2 className="w-3 h-3" /> SPORTA
              </button>
            </Link>
            <Link href="/features">
              <button className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors">
                Features
              </button>
            </Link>
            <Link href="/career-hub">
              <button className="nav-link text-neon-cyan/90 hover:text-neon-cyan font-orbitron text-xs tracking-wide transition-colors">
                Career Hub
              </button>
            </Link>
            <Link href="/features">
              <button className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors" data-testid="nav-powerhub-trigger">
                PowerHub
              </button>
            </Link>
          </div>

          {/* Desktop auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Light / dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="text-galactic-orange hover:text-galactic-gold h-8 w-8"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {user ? (
              <>
                <Link href="/chat">
                  <button className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron text-sm flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> Talk
                  </button>
                </Link>
                <NotificationBell />
                {user.role === "admin" && (
                  <Link href="/dashboard">
                    <button className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron text-sm flex items-center gap-1">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                  </Link>
                )}
                <Link href={`/profile/${user.id}`}>
                  <button className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron text-sm flex items-center gap-1">
                    <User className="w-3 h-3" /> {user.username}
                  </button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => logout()}
                  className="text-galactic-orange/70 hover:text-galactic-red font-orbitron text-xs h-8 px-3"
                >
                  <LogOut className="w-3 h-3 mr-1" /> Sign Out
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs h-8 hover:shadow-[0_0_16px_rgba(34,197,94,0.4)] transition-all"
                >
                  <LogIn className="w-3 h-3 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Light / dark mode toggle (mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="text-galactic-orange hover:text-galactic-gold h-8 w-8"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {/* Notification bell (mobile) */}
            {user && <NotificationBell />}
            <Button
              variant="ghost"
              size="icon"
              className="text-galactic-orange hover:text-galactic-gold"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-3 glass-effect-strong rounded-xl p-5 animate-slide-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors"
                  data-testid={`mobile-nav-link-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
              <Link href="/blog" onClick={() => setIsOpen(false)}>
                <button className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors">
                  Blog
                </button>
              </Link>
              <Link href="/features" onClick={() => setIsOpen(false)}>
                <button className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors">
                  Features
                </button>
              </Link>
              <Link href="/career-hub" onClick={() => setIsOpen(false)}>
                <button className="text-left nav-link text-neon-cyan/90 hover:text-neon-cyan font-orbitron text-sm transition-colors">
                  Career Hub
                </button>
              </Link>

              {/* PowerHub link (mobile) */}
              <Link href="/features" onClick={() => setIsOpen(false)}>
                <button className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors" data-testid="mobile-nav-powerhub-trigger">
                  PowerHub
                </button>
              </Link>

              <div className="h-px my-1" style={{ background: "rgba(34,197,94,0.15)" }} />

              {user ? (
                <>
                  <Link href={`/profile/${user.id}`} onClick={() => setIsOpen(false)}>
                    <button className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1">
                      <User className="w-3 h-3" /> {user.username}
                    </button>
                  </Link>
                  <Link href="/chat" onClick={() => setIsOpen(false)}>
                    <button className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Talk
                    </button>
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <button className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1">
                        <LayoutDashboard className="w-3 h-3" /> Dashboard
                      </button>
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="text-left text-galactic-red/80 font-orbitron text-sm hover:text-galactic-red flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setIsOpen(false)}>
                  <button className="text-left text-galactic-orange font-orbitron text-sm hover:text-galactic-gold flex items-center gap-2 transition-colors">
                    <LogIn className="w-4 h-4" /> Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
