import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, LogOut, User, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { id: 'services', label: 'Services' },
    { id: 'case-studies', label: 'Case Studies' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'military-nav backdrop-blur-xl' : 'military-nav'
    }`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer" data-testid="nav-logo">
              <div className="w-12 h-12 border-2 border-galactic-orange rounded-full flex items-center justify-center bg-gradient-to-br from-galactic-orange to-galactic-gold">
                <span className="text-space-black font-orbitron font-bold text-xl">TST</span>
              </div>
              <span className="font-orbitron font-bold text-xl gradient-text">TOBSEYTECH</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron"
                data-testid={`nav-link-${link.id}`}
              >
                {link.label}
              </button>
            ))}
            <Link href="/blog">
              <button className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron">
                Blog
              </button>
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/chat">
                  <button className="hover:text-galactic-gold transition-colors duration-300 text-galactic-orange" title="Messages">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron text-sm flex items-center gap-1">
                    <User className="w-3 h-3" /> {user.username}
                  </button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => logout()}
                  className="text-galactic-orange hover:text-galactic-gold font-orbitron text-xs"
                >
                  <LogOut className="w-3 h-3 mr-1" /> Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button size="sm" className="bg-galactic-orange text-space-black font-orbitron font-bold hover:bg-galactic-gold text-xs">
                  <LogIn className="w-3 h-3 mr-1" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-galactic-orange"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-toggle"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 glass-effect rounded-lg p-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron"
                  data-testid={`mobile-nav-link-${link.id}`}
                >
                  {link.label}
                </button>
              ))}
              <Link href="/blog" onClick={() => setIsOpen(false)}>
                <button className="text-left hover:text-galactic-gold transition-colors duration-300 nav-link text-galactic-orange font-orbitron">
                  Blog
                </button>
              </Link>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <button className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1">
                      <User className="w-3 h-3" /> {user.username}
                    </button>
                  </Link>
                  <Link href="/chat" onClick={() => setIsOpen(false)}>
                    <button className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> Messages
                    </button>
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={() => setIsOpen(false)}>
                  <button className="text-left text-galactic-orange font-orbitron hover:text-galactic-gold flex items-center gap-1">
                    <LogIn className="w-3 h-3" /> Sign In
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

