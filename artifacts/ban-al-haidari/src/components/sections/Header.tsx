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
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const navLinks = [
    { name: t.nav.about, href: "#about" },
    { name: t.nav.mission, href: "#mission" },
    { name: t.nav.products, href: "#products" },
    { name: t.nav.testimonials, href: "#testimonials" },
    { name: t.nav.contact, href: "#footer" },
  ];

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? t.auth.myAccount;

  const closeAll = () => { setDrawerOpen(false); setUserMenuOpen(false); };

  const handleGoProfile = () => { closeAll(); navigate("/profile"); };
  const handleGoAdmin = () => { closeAll(); navigate("/admin"); };
  const handleLogout = async () => { closeAll(); await logOut(); };

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

          {/* Right side controls */}
          <div className="flex items-center gap-2 md:gap-3">

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
                        <button onClick={handleGoProfile} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors text-start">
                          <User size={13} />{lang === "ar" ? "ملفي الشخصي" : "My Profile"}
                        </button>
                        {isAdmin && (
                          <button onClick={handleGoAdmin} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors text-start">
                            <LayoutDashboard size={13} />{lang === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                          </button>
                        )}
                        <div className="h-px bg-primary/10 my-1" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-colors text-start">
                          <LogOut size={13} />{t.auth.logout}
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

            {/* Hamburger — all screen sizes */}
            <button
              className="w-10 h-10 flex items-center justify-center text-foreground hover:text-primary border border-white/10 hover:border-primary/40 transition-all rounded-sm"
              onClick={() => setDrawerOpen(true)}
              data-testid="button-menu"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Side Drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer panel — slides from the right */}
            <motion.aside
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 right-0 z-[70] w-72 flex flex-col bg-[#0d0916] border-l border-primary/20 shadow-[−8px_0_60px_rgba(0,0,0,0.6)]"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {/* Top gold line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

              {/* Drawer header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/6">
                <img src="/logo.png" alt="Logo" className="h-14 object-contain drop-shadow-[0_0_14px_rgba(212,175,55,0.5)]" />
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 flex items-center justify-center border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all rounded-sm"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.name}
                    href={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, duration: 0.25 }}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium tracking-[0.12em] uppercase text-foreground/75 hover:text-primary hover:bg-primary/5 rounded-sm transition-all group"
                    data-testid={`link-nav-${link.href.replace("#", "")}`}
                  >
                    <span className="w-4 h-[1px] bg-primary/40 group-hover:bg-primary group-hover:w-6 transition-all duration-300" />
                    {link.name}
                  </motion.a>
                ))}
              </nav>

              {/* CTA button */}
              <div className="px-6 pb-8 pt-4 border-t border-white/6">
                <a
                  href="#products"
                  onClick={() => setDrawerOpen(false)}
                  className="block w-full text-center py-3.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-[0.2em] text-sm font-semibold rounded-sm"
                >
                  {t.nav.book}
                </a>
              </div>

              {/* Bottom gold line */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
