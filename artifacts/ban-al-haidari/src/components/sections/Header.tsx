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
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
    navigate("/profile");
  };

  const handleGoAdmin = () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate("/admin");
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMenuOpen(false);
    await logOut();
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-primary/0 ${
          scrolled
            ? "bg-background/80 backdrop-blur-md border-primary/30 shadow-[0_4px_30px_rgba(212,175,55,0.1)] py-2"
            : "bg-transparent py-3"
        }`}
      >
        <div className="container mx-auto px-5 flex items-center justify-between">

          {/* Logo */}
          <a href="#" className="block group" data-testid="link-home">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl scale-75 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
              <img
                src="/logo.png"
                alt="Ban Al-Haidari Logo"
                className="relative h-20 md:h-[90px] object-contain transition-all duration-500 drop-shadow-[0_0_18px_rgba(212,175,55,0.55)] group-hover:drop-shadow-[0_0_32px_rgba(212,175,55,0.85)]"
                data-testid="img-logo"
              />
            </div>
          </a>

          {/* Right side — always visible: book + auth + lang + hamburger */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Book a session — visible on md+ */}
            <a
              href="#products"
              className="hidden md:inline-flex px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
              data-testid="link-nav-book"
            >
              {t.nav.book}
            </a>

            {/* User account */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 text-primary hover:bg-primary/10 transition-all text-xs uppercase tracking-widest"
                  data-testid="button-user-menu"
                >
                  <UserCircle size={15} />
                  <span className="hidden sm:inline max-w-[90px] truncate">{displayName}</span>
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
                      <div className="px-3 py-2 border-b border-primary/10">
                        <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                      </div>
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
                className="px-3 py-2 bg-primary/10 border border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs font-semibold tracking-widest uppercase"
                data-testid="button-open-auth"
              >
                {t.auth.login}
              </button>
            )}

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-2 border border-primary/30 text-primary/70 hover:border-primary hover:text-primary transition-all duration-300 text-xs font-semibold tracking-widest uppercase"
              data-testid="button-lang-toggle"
            >
              {lang === "ar" ? "EN" : "عربي"}
            </button>

            {/* Hamburger — ALL screen sizes */}
            <button
              className="flex flex-col items-center justify-center w-9 h-9 gap-[5px] text-foreground hover:text-primary transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-menu"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X size={22} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ opacity: 0, rotate: 90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: -90 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-[5px]"
                  >
                    <span className="w-5 h-[1.5px] bg-current block" />
                    <span className="w-5 h-[1.5px] bg-current block" />
                    <span className="w-5 h-[1.5px] bg-current block" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Full-width dropdown nav — all screen sizes */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full bg-background/97 backdrop-blur-lg border-b border-primary/20 shadow-2xl"
            >
              {/* Nav links */}
              <nav className="container mx-auto px-6 py-6 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 sm:gap-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm uppercase tracking-[0.2em] font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setMenuOpen(false)}
                    data-testid={`link-nav-${link.href.replace("#", "")}`}
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              {/* Book button */}
              <div className="container mx-auto px-6 pb-6 flex justify-center">
                <a
                  href="#products"
                  className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-semibold"
                  onClick={() => setMenuOpen(false)}
                >
                  {t.nav.book}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
