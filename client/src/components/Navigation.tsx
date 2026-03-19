import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User, MessageCircle, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import NotificationBell from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function MobilePowerHill({ features, onSelect }: { features: { id: string; label: string; href: string }[]; onSelect: (href: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
        data-testid="mobile-nav-powerhill-trigger"
      >
        Power-Hill <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-3 mt-2 flex flex-col gap-2 border-l border-galactic-orange/20 pl-3">
          {features.map((feature) => (
            <button
              key={feature.id}
              onClick={() => onSelect(feature.href)}
              className="text-left text-galactic-orange/80 hover:text-galactic-gold font-orbitron text-xs transition-colors"
              data-testid={`mobile-nav-powerhill-${feature.id}`}
            >
              {feature.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const powerHillFeatures = [
    { id: "roi-calculator", label: "01 · ROI Calculator", href: "/feature/roi-calculator" },
    { id: "innovation-roadmap", label: "02 · Innovation Roadmap", href: "/feature/innovation-roadmap" },
    { id: "skills-quiz", label: "03 · Digital Skills Assessment", href: "/feature/skills-quiz" },
    { id: "tech-trends", label: "04 · Tech Trends Radar", href: "/feature/tech-trends" },
    { id: "learning-path", label: "05 · Learning Path", href: "/learning-path" },
    { id: "challenges", label: "06 · Community Challenges", href: "/feature/challenges" },
    { id: "resources", label: "07 · Resource Library", href: "/feature/resources" },
    { id: "investor-metrics", label: "08 · Investor KPI Dashboard", href: "/feature/investor-metrics" },
    { id: "service-comparison", label: "09 · Service Comparison", href: "/feature/service-comparison" },
    { id: "startup-toolkit", label: "10 · Startup Digital Toolkit", href: "/feature/startup-toolkit" },
    { id: "badges", label: "11 · Achievement Badges", href: "/profile" },
    { id: "partners", label: "12 · Partner Network", href: "/feature/partners" },
    { id: "mentorship", label: "13 · Mentorship Network", href: "/feature/mentorship" },
    { id: "live-demo", label: "14 · Live Platform Demo", href: "/feature/live-demo" },
    { id: "global-impact", label: "15 · Global Impact Map", href: "/feature/global-impact" },
    { id: "features-hub", label: "16 · Features Hub", href: "/features" },
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors flex items-center gap-1" data-testid="nav-powerhill-trigger">
                  Power-Hill <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-space-black border border-galactic-orange/30 max-h-96 overflow-y-auto z-50"
                align="start"
              >
                {powerHillFeatures.map((feature) => (
                  <DropdownMenuItem key={feature.id} asChild className="text-galactic-orange/90 hover:text-galactic-gold hover:bg-galactic-orange/10 font-orbitron text-xs cursor-pointer">
                    <Link href={feature.href} onClick={() => setIsOpen(false)}>
                      {feature.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

              {/* Power-Hill dropdown (mobile) */}
              <MobilePowerHill features={powerHillFeatures} onSelect={(href) => { navigate(href); setIsOpen(false); }} />

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
                  <div onClick={() => setIsOpen(false)}>
                    <NotificationBell />
                  </div>
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
