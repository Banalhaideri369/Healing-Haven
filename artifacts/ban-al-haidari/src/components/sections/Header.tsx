import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, toggleLang, lang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.about, href: "#about" },
    { name: t.nav.services, href: "#services" },
    { name: t.nav.testimonials, href: "#testimonials" },
    { name: t.nav.contact, href: "#contact" },
  ];

  return (
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
              className="relative h-16 md:h-[110px] object-contain transition-all duration-500 drop-shadow-[0_0_18px_rgba(212,175,55,0.55)] group-hover:drop-shadow-[0_0_32px_rgba(212,175,55,0.85)]"
              data-testid="img-logo"
            />
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-[0.15em] font-medium text-foreground hover:text-primary transition-colors"
              data-testid={`link-nav-${link.href.replace("#", "")}`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            className="px-5 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
            data-testid="link-nav-book"
          >
            {t.nav.book}
          </a>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="px-4 py-2 border border-primary/40 text-primary/80 hover:border-primary hover:text-primary transition-all duration-300 text-xs font-semibold tracking-widest uppercase"
            data-testid="button-lang-toggle"
            aria-label="Toggle language"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
        </nav>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 border border-primary/40 text-primary/80 hover:border-primary hover:text-primary transition-all duration-300 text-xs font-semibold"
            data-testid="button-lang-toggle-mobile"
            aria-label="Toggle language"
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
            className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-lg border-b border-primary/20 flex flex-col items-center py-8 gap-6 shadow-2xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg uppercase tracking-[0.2em] font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-sm font-semibold mt-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t.nav.book}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
