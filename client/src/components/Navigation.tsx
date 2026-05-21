import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User, MessageCircle, LayoutDashboard, Globe2, Sun, Moon, Settings, ChevronDown, Bot, Code, Brain, Palette, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import NotificationBell from "@/components/NotificationBell";

const featuredServices = [
  {
    icon: Bot,
    label: "Automation Systems",
    description: "Smart workflows that handle repetitive tasks 24/7",
  },
  {
    icon: Code,
    label: "Web & App Dev",
    description: "Fast, conversion-ready websites and mobile apps",
  },
  {
    icon: Brain,
    label: "AI Integrations",
    description: "Connect AI tools — chatbots, smart search, and more",
  },
  {
    icon: BarChart3,
    label: "Strategic Consulting",
    description: "Product planning and go-to-market strategies",
  },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/case-studies", label: "Case Studies" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
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
            {/* Services mega-dropdown */}
            <div className="relative" ref={servicesRef}>
              <button
                className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors flex items-center gap-1"
                data-testid="nav-link-services"
                onClick={() => setServicesOpen((v) => !v)}
                onMouseEnter={() => setServicesOpen(true)}
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Services <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega dropdown panel */}
              <div
                className="absolute top-full left-0 mt-3 w-80 rounded-xl border border-galactic-orange/20 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(20,16,8,0.98) 0%, rgba(34,27,15,0.97) 100%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(180,25,25,0.1)",
                  opacity: servicesOpen ? 1 : 0,
                  pointerEvents: servicesOpen ? "auto" : "none",
                  transform: servicesOpen ? "translateY(0)" : "translateY(-8px)",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                }}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <div className="h-px w-full" style={{ background: "linear-gradient(90deg, var(--galactic-orange), var(--galactic-gold), transparent)" }} />
                <div className="p-3 grid gap-1">
                  {featuredServices.map(({ icon: Icon, label, description }) => (
                    <Link key={label} href="/services" onClick={() => setServicesOpen(false)}>
                      <div className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-galactic-orange/10 transition-colors cursor-pointer group">
                        <div className="mt-0.5 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md bg-galactic-orange/15 text-galactic-orange group-hover:bg-galactic-orange/25 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-orbitron text-galactic-gold leading-none mb-1">{label}</p>
                          <p className="text-xs text-gray-400 leading-snug">{description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-3 pb-3">
                  <Link href="/services" onClick={() => setServicesOpen(false)}>
                    <button className="w-full py-2 text-xs font-orbitron text-galactic-orange border border-galactic-orange/30 rounded-lg hover:bg-galactic-orange/10 transition-colors">
                      See All Services →
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <button
                  className="nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-xs tracking-wide transition-colors"
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                </button>
              </Link>
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
            <Link href="/doc">
              <button className="nav-link text-neon-cyan/90 hover:text-neon-cyan font-orbitron text-xs tracking-wide transition-colors">
                Docs
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
                <Link href={`/profile/${user.id}#privacy-security`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Privacy & Security settings"
                    className="text-galactic-orange/70 hover:text-galactic-gold h-8 w-8"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
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
              {/* Services accordion */}
              <div>
                <button
                  className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors flex items-center gap-1 w-full"
                  onClick={() => setMobileServicesOpen((v) => !v)}
                  aria-expanded={mobileServicesOpen}
                >
                  Services
                  <ChevronDown className={`w-3 h-3 ml-auto transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`} />
                </button>
                {mobileServicesOpen && (
                  <div className="mt-2 ml-3 flex flex-col gap-2 border-l border-galactic-orange/20 pl-3">
                    {featuredServices.map(({ icon: Icon, label }) => (
                      <Link key={label} href="/services" onClick={() => { setIsOpen(false); setMobileServicesOpen(false); }}>
                        <button className="text-left text-galactic-orange/80 hover:text-galactic-gold font-orbitron text-xs flex items-center gap-2 transition-colors">
                          <Icon className="w-3 h-3" /> {label}
                        </button>
                      </Link>
                    ))}
                    <Link href="/services" onClick={() => { setIsOpen(false); setMobileServicesOpen(false); }}>
                      <button className="text-left text-galactic-gold font-orbitron text-xs">
                        See All →
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}>
                  <button
                    className="text-left nav-link text-galactic-orange/90 hover:text-galactic-gold font-orbitron text-sm transition-colors"
                    data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {link.label}
                  </button>
                </Link>
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
              <Link href="/doc" onClick={() => setIsOpen(false)}>
                <button className="text-left nav-link text-neon-cyan/90 hover:text-neon-cyan font-orbitron text-sm transition-colors">
                  Docs
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
                  <Link href={`/profile/${user.id}#privacy-security`} onClick={() => setIsOpen(false)}>
                    <button className="text-left text-galactic-orange/70 font-orbitron hover:text-galactic-gold flex items-center gap-1 text-sm">
                      <Settings className="w-3 h-3" /> Settings
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
