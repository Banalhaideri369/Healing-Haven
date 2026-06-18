import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, UserCircle, LayoutDashboard, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/auth";
import { AuthModal } from "./AuthModal";
import { useLocation } from "wouter";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t, toggleLang, lang } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { name: t.nav.about, href: "#about" },
    { name: t.nav.mission, href: "#mission" },
    { name: t.nav.products, href: "#products" },
    { name: t.nav.testimonials, href: "#testimonials" },
    { name: t.nav.contact, href: "#footer" },
  ];

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? t.auth.myAccount;

  const handleGoProfile = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/profile");
  };

  const handleGoAdmin = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate("/admin");
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await logOut();
  };

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
                className="relative h-20 md:h-[100px] object-contain transition-all duration-500 drop-shadow-[0_0_18px_rgba(212,175,55,0.55)] group-hover:drop-shadow-[0_0_32px_rgba(212,175,55,0.85)]"
                data-testid="img-logo"
              />
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center flex-wrap gap-x-4 lg:gap-x-6 gap-y-2">
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
              href="#products"
              className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
              data-testid="link-nav-book"
            >
              {t.nav.book}
            </a>

            {/* Auth area */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 border border-primary/30 text-primary hover:bg-primary/10 transition-all text-xs uppercase tracking-widest"
                  data-testid="button-user-menu"
                >
                  <UserCircle size={15} />
                  <span className="max-w-[100px] truncate">{displayName}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute end-0 top-full mt-2 w-48 bg-[#0f0a12] border border-primary/20 shadow-[0_8px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden"
                    >
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <div className="p-2 space-y-0.5">
                        <button
                          onClick={handleGoProfile}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-start"
                          data-testid="button-goto-profile"
                        >
                          <User size={13} />
                          {lang === "ar" ? "ملفي الشخصي" : "My Profile"}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={handleGoAdmin}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors text-start"
                            data-testid="button-goto-admin"
                          >
                            <LayoutDashboard size={13} />
                            {lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                          </button>
                        )}
                        <div className="h-px bg-primary/10 my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors text-start"
                          data-testid="button-logout"
                        >
                          <LogOut size={13} />
                          {t.auth.logout}
                        </button>
                      </div>
                      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1 text-xs text-primary border border-primary/30 px-2 py-1.5"
                data-testid="button-user-menu-mobile"
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

        {/* Mobile user dropdown */}
        <AnimatePresence>
          {userMenuOpen && user && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="md:hidden absolute top-full right-4 w-52 bg-[#0f0a12] border border-primary/20 shadow-[0_8px_40px_rgba(0,0,0,0.7)] z-50"
            >
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="p-2 space-y-0.5">
                <div className="px-3 py-2 border-b border-primary/10 mb-1">
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleGoProfile}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-start"
                >
                  <User size={13} />
                  {lang === "ar" ? "ملفي الشخصي" : "My Profile"}
                </button>
                {isAdmin && (
                  <button
                    onClick={handleGoAdmin}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors text-start"
                  >
                    <LayoutDashboard size={13} />
                    {lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                  </button>
                )}
                <div className="h-px bg-primary/10 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors text-start"
                >
                  <LogOut size={13} />
                  {t.auth.logout}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                href="#products"
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
