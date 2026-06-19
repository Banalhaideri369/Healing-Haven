import React from "react";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { About } from "@/components/sections/About";
import { Mission } from "@/components/sections/Mission";
import { Products } from "@/components/sections/Products";
import { Testimonials } from "@/components/sections/Testimonials";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-foreground overflow-x-hidden">
      <Header />
      <main className="flex-1">
        <Hero />
        <HeroBanner />
        <About />
        <Mission />
        <Products />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
