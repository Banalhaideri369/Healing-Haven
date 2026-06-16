import { motion } from "framer-motion";
import type { Variants, Transition } from "framer-motion";

export const SOCIAL = {
  instagram: {
    href: "https://www.instagram.com/ban_infinity369?igsh=dXk3bXNkeWtocmE3",
    label: "Instagram",
    color: "#E1306C",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  telegram: {
    href: "https://t.me/waewafra_live",
    label: "Telegram",
    color: "#2AABEE",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M21.93 3.52a1.5 1.5 0 0 0-1.57-.22L2.74 10.66a1.5 1.5 0 0 0 .08 2.78l4.2 1.4 1.58 5.07a1 1 0 0 0 1.7.39l2.43-2.43 4.74 3.49a1.5 1.5 0 0 0 2.33-1.01l2.28-15.5a1.5 1.5 0 0 0-.15-.83zM10.27 15.2l-.9 2.9-.9-3.3 8.7-8.2-7.9 8.6z" />
      </svg>
    ),
  },
  whatsapp: {
    href: "https://wa.me/610405356021",
    label: "WhatsApp",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.19-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12 2a10 10 0 0 0-8.67 14.97L2 22l5.17-1.35A10 10 0 1 0 12 2z" />
      </svg>
    ),
  },
} as const;

const shakeTransition: Transition = { duration: 0.7 };

const shakeVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  shake: {
    rotate: [0, -14, 14, -10, 10, -6, 6, 0],
    scale: [1, 1.12, 1.12, 1.08, 1.08, 1.04, 1.04, 1],
    transition: shakeTransition,
  },
};

interface SocialLinksProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function SocialLinks({ size = "md", showLabel = false, className = "" }: SocialLinksProps) {
  const sizeMap = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-16 h-16" };
  const iconMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-7 h-7" };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {(Object.values(SOCIAL)).map((social, idx) => (
        <div key={social.label} className="flex flex-col items-center gap-2">
          <motion.a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className={`${sizeMap[size]} rounded-full flex items-center justify-center border-2 transition-colors duration-300 cursor-pointer`}
            style={{
              borderColor: `${social.color}55`,
              color: social.color,
              background: `${social.color}12`,
            }}
            whileHover={{
              scale: 1.15,
              boxShadow: `0 0 22px ${social.color}80`,
              borderColor: social.color,
            }}
            variants={shakeVariants}
            initial="idle"
            animate="idle"
            whileInView="shake"
            viewport={{ once: false }}
            transition={{ delay: idx * 0.15 }}
            onAnimationComplete={(def) => {
              if (def === "shake") {
                // retrigger shake every 2s via CSS workaround: handled by useEffect below
              }
            }}
            data-testid={`link-social-${social.label.toLowerCase()}`}
          >
            <span className={iconMap[size]}>{social.icon}</span>
          </motion.a>
          {showLabel && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {social.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Self-shaking version: re-triggers the animation every 2 seconds automatically */
export function SocialIconsPulsing({ size = "md", showLabel = false, className = "" }: SocialLinksProps) {
  const sizeMap = { sm: "w-10 h-10", md: "w-14 h-14", lg: "w-16 h-16" };
  const iconMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-7 h-7" };

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      {(Object.values(SOCIAL)).map((social, idx) => (
        <div key={social.label} className="flex flex-col items-center gap-2">
          <motion.a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className={`${sizeMap[size]} rounded-full flex items-center justify-center border-2 transition-colors duration-300 cursor-pointer`}
            style={{
              borderColor: `${social.color}55`,
              color: social.color,
              background: `${social.color}12`,
            }}
            animate={{
              rotate: [0, -14, 14, -10, 10, -5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              scale:  [1, 1.12, 1.12, 1.08, 1.08, 1.04, 1.04, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 0,
              ease: "easeInOut",
              delay: idx * 0.2,
            }}
            whileHover={{
              scale: 1.2,
              boxShadow: `0 0 28px ${social.color}90`,
              rotate: 0,
            }}
            data-testid={`link-social-${social.label.toLowerCase()}`}
          >
            <span className={iconMap[size]}>{social.icon}</span>
          </motion.a>
          {showLabel && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {social.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
