import React from "react";

export function Footer() {
  return (
    <footer className="bg-background py-16 border-t border-primary/10">
      <div className="container mx-auto px-6 flex flex-col items-center text-center">
        <a href="#" className="mb-8 block">
          <img src="/logo.png" alt="Ban Al-Haidari Logo" className="h-[80px] object-contain" data-testid="img-footer-logo" />
        </a>
        
        <p className="text-primary font-serif text-xl mb-8 italic">
          "Sacred Energy Healing"
        </p>

        <div className="flex gap-8 mb-12">
          {["Instagram", "Facebook", "Spotify"].map((social) => (
            <a 
              key={social} 
              href={`#${social.toLowerCase()}`} 
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              {social}
            </a>
          ))}
        </div>

        <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-8" />

        <p className="text-xs text-muted-foreground/60 font-light tracking-wider">
          &copy; {new Date().getFullYear()} Ban Al-Haidari. All rights reserved. <br/>
          <span className="mt-2 inline-block">Designed for the Sacred</span>
        </p>
      </div>
    </footer>
  );
}
