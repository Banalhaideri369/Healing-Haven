import React, { useState } from "react";
import { motion } from "framer-motion";

export function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    // Simulate network request
    setTimeout(() => {
      setStatus("success");
    }, 1500);
  };

  return (
    <section id="contact" className="py-24 md:py-32 relative bg-[#0f0a12] border-t border-primary/20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="flex flex-col md:flex-row gap-16">
          
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full md:w-5/12"
          >
            <h2 className="text-primary uppercase tracking-[0.2em] text-sm font-semibold mb-4">Reservation</h2>
            <h3 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
              Begin Your <span className="italic text-muted">Journey</span>
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed mb-10">
              Sanctuary sessions are strictly by appointment. Please fill out the inquiry form to request a consultation. Our concierge will be in touch within 24 hours to schedule your healing experience.
            </p>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-serif text-xl text-primary mb-2">Location</h4>
                <p className="text-muted-foreground font-light">The Healing Sanctuary<br />Private Address provided upon booking.</p>
              </div>
              <div>
                <h4 className="font-serif text-xl text-primary mb-2">Contact</h4>
                <p className="text-muted-foreground font-light">concierge@banalhaidari.com<br />+1 (555) 019-8273</p>
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-7/12"
          >
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center p-12 border border-primary/20 bg-card/50 text-center" data-testid="contact-success">
                <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-6 text-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h4 className="font-serif text-3xl text-foreground mb-4">Request Received</h4>
                <p className="text-muted-foreground font-light">
                  Thank you. Our concierge will contact you shortly to finalize your appointment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <input 
                      id="name" 
                      required 
                      className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light" 
                      placeholder="Jane Doe"
                      data-testid="input-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input 
                      id="email" 
                      type="email" 
                      required 
                      className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light" 
                      placeholder="jane@example.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="service" className="text-xs uppercase tracking-widest text-muted-foreground">Service Interest</label>
                  <select 
                    id="service" 
                    className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light appearance-none"
                    data-testid="select-service"
                  >
                    <option value="reiki">Reiki Healing</option>
                    <option value="chakra">Chakra Balancing</option>
                    <option value="quantum">Quantum Energy Work</option>
                    <option value="distance">Distance Healing</option>
                    <option value="unsure">Not sure, seeking guidance</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs uppercase tracking-widest text-muted-foreground">Your Intention</label>
                  <textarea 
                    id="message" 
                    rows={4} 
                    className="w-full bg-background border-b border-primary/30 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-light resize-none" 
                    placeholder="Briefly describe what you are seeking to heal or shift..."
                    data-testid="textarea-message"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="w-full py-4 bg-primary text-primary-foreground uppercase tracking-widest font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-70 mt-4"
                  data-testid="button-submit-contact"
                >
                  {status === "submitting" ? "Submitting..." : "Request Appointment"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
