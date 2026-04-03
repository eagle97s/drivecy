"use client";

import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { CarGrid } from "@/components/car-grid";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CarGrid />
      </main>
      <Footer />
    </div>
  );
}
