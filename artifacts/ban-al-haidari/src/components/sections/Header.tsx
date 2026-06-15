import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 border-b border-primary/0 ${
        scrolled ? "bg-background/80 backdrop-blur-md border-primary/30 shadow-[0_4px_30px_rgba(212,175,55,0.1)] py-2" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a href="#" className="block" data-testid="link-home">
          <img src="/logo.png" alt="Ban Al-Haidari Logo" className="h-16 md:h-[120px] object-contain transition-all duration-500" data-testid="img-logo" />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm uppercase tracking-[0.2em] font-medium text-foreground hover:text-primary transition-colors"
              data-testid={`link-nav-${link.name.toLowerCase()}`}
            >
              {link.name}
            </a>
          ))}
          <a
            href="#contact"
            className="px-6 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
            data-testid="link-nav-book"
          >
            Book Session
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-foreground hover:text-primary"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
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
              Book Session
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
