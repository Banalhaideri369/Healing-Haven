import { motion } from "framer-motion";
import { ShoppingCart, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const productImages = [
  "/product-1.jpg",
  "/product-2.jpg",
  "/product-3.jpg",
  "/product-4.jpg",
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export function Products() {
  const { t } = useLanguage();

  return (
    <section id="products" className="py-24 md:py-32 relative bg-[#0f0a12] border-y border-primary/10 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4"
          >
            {t.products.label}
          </motion.h2>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            {t.products.heading1}{" "}
            <span className="italic text-muted">{t.products.heading2}</span>
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-muted-foreground font-light max-w-xl mx-auto"
          >
            {t.products.subtitle}
          </motion.p>
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {t.products.items.map((product, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative bg-card border border-primary/10 hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col"
              data-testid={`product-card-${index}`}
            >
              {/* Hover top glow line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Product Image */}
              <div className="relative overflow-hidden aspect-[4/3]">
                <img
                  src={productImages[index]}
                  alt={product.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 start-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest">
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8 flex flex-col flex-1">
                <h4 className="font-serif text-2xl md:text-3xl text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {product.title}
                </h4>
                <p className="text-muted-foreground font-light leading-relaxed mb-6 flex-1">
                  {product.description}
                </p>

                {/* Features list */}
                {product.features && product.features.length > 0 && (
                  <ul className="mb-6 space-y-2">
                    {product.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Price */}
                <div className="mb-6 pt-4 border-t border-primary/10">
                  <span className="font-serif text-2xl text-primary">{product.price}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all duration-200"
                    data-testid={`button-buy-${index}`}
                    onClick={() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <ShoppingCart size={16} />
                    {t.products.buyNow}
                  </button>

                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary font-semibold text-sm uppercase tracking-widest hover:bg-primary/10 active:scale-95 transition-all duration-200"
                    data-testid={`button-pay-${index}`}
                    onClick={() => {
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <CreditCard size={16} />
                    {t.products.payNow}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
