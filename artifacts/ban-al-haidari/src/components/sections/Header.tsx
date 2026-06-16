import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/auth";
import { AuthModal } from "./AuthModal";
import { useLocation } from "wouter";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { t, toggleLang, lang } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.about, href: "#about" },
    { name: t.nav.mission, href: "#mission" },
    { name: t.nav.products, href: "#products" },
    { name: t.nav.testimonials, href: "#testimonials" },
    { name: t.nav.contact, href: "#contact" },
  ];

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? t.auth.myAccount;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-primary/0 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-primary/30 shadow-[0_4px_30px_rgba(212,175,55,0.1)] py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <a href="#" className="block group" data-testid="link-home">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-75 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
              <img
                src="/logo.png"
                alt="Ban Al-Haidari Logo"
                className="relative h-24 md:h-[150px] object-contain transition-all duration-500 drop-shadow-[0_0_18px_rgba(212,175,55,0.55)] group-hover:drop-shadow-[0_0_32px_rgba(212,175,55,0.85)]"
                data-testid="img-logo"
              />
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-[0.15em] font-medium text-foreground hover:text-primary transition-colors"
                data-testid={`link-nav-${link.href.replace("#", "")}`}
              >
                {link.name}
              </a>
            ))}

            <a
              href="#contact"
              className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
              data-testid="link-nav-book"
            >
              {t.nav.book}
            </a>

            {/* Auth button */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-1.5 text-xs text-primary font-medium hover:text-primary/80 transition-colors border border-primary/30 px-3 py-2 hover:bg-primary/10"
                    data-testid="button-dashboard"
                  >
                    <LayoutDashboard size={14} />
                    {t.auth.dashboard}
                  </button>
                )}
                <button
                  onClick={() => logOut()}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-2"
                  data-testid="button-logout"
                  title={t.auth.logout}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-2 bg-primary/10 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs font-semibold tracking-widest uppercase"
                data-testid="button-open-auth"
              >
                {t.auth.login}
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-2 border border-primary/30 text-primary/70 hover:border-primary hover:text-primary transition-all duration-300 text-xs font-semibold tracking-widest uppercase"
              data-testid="button-lang-toggle"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>
          </nav>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <button
                onClick={() => logOut()}
                className="flex items-center gap-1 text-xs text-primary"
                data-testid="button-logout-mobile"
              >
                <UserCircle size={18} />
              </button>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-3 py-1.5 bg-primary/10 border border-primary/40 text-primary text-xs font-semibold"
                data-testid="button-open-auth-mobile"
              >
                {t.auth.login}
              </button>
            )}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 border border-primary/40 text-primary/80 text-xs font-semibold"
              data-testid="button-lang-toggle-mobile"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>
            <button
              className="text-foreground hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-lg border-b border-primary/20 flex flex-col items-center py-8 gap-5 shadow-2xl"
            >
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-base uppercase tracking-[0.2em] font-medium text-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <a
                href="#contact"
                className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-semibold mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.nav.book}
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
