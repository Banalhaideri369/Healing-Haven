import { useLanguage } from "@/contexts/LanguageContext";
import { SocialIconsPulsing } from "@/components/SocialLinks";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-background py-16 border-t border-primary/10">
      <div className="container mx-auto px-6 flex flex-col items-center text-center">
        <a href="#" className="mb-8 block group">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/15 blur-2xl scale-75 opacity-60 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
            <img
              src="/logo.png"
              alt="Ban Al-Haidari Logo"
              className="relative h-[140px] object-contain drop-shadow-[0_0_22px_rgba(212,175,55,0.5)] group-hover:drop-shadow-[0_0_40px_rgba(212,175,55,0.9)] transition-all duration-500"
              data-testid="img-footer-logo"
            />
          </div>
        </a>

        <p className="text-primary font-serif text-xl mb-10 italic">
          "{t.footer.tagline}"
        </p>

        <SocialIconsPulsing size="md" showLabel className="justify-center mb-12" />

        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-8" />

        <p className="text-xs text-muted-foreground/60 font-light tracking-wider">
          &copy; {new Date().getFullYear()} Ban Al-Haidari. {t.footer.rights}
          <br />
          <span className="mt-2 inline-block">{t.footer.designed}</span>
        </p>
      </div>
    </footer>
  );
}
