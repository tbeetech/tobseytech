import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User, MessageCircle, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-galactic-orange to-galactic-gold flex items-center justify-center shadow-[0_0_16px_rgba(255,165,0,0.35)]">
                <span className="text-space-black font-orbitron font-black text-base">T</span>
              </div>
              <span className="font-orbitron font-bold text-lg gradient-text">TOBSEYTECH</span>
            </div>
          </Link>

          {/* Gradient separator (desktop only) */}
          <div
            className="hidden md:block h-6 w-px mx-4"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(255,165,0,0.3), transparent)" }}
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
          </div>

          {/* Desktop auth actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/chat">
                  <button className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron text-sm flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" /> Talk
                  </button>
                </Link>
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
                  className="bg-gradient-to-r from-galactic-orange to-galactic-gold text-space-black font-orbitron font-bold text-xs h-8 hover:shadow-[0_0_16px_rgba(255,165,0,0.4)] transition-all"
                >
                  <LogIn className="w-3 h-3 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-galactic-orange hover:text-galactic-gold"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
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

              <div className="h-px my-1" style={{ background: "rgba(255,165,0,0.15)" }} />

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
