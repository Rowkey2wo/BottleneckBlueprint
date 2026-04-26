"use client";

import { useRef, useState, useEffect } from "react";
import Navbar from "./components/navbar";
import HeroSection from "./components/HeroSection";
import SpecsSection from "./components/SpecsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import StatsSection from "./components/StatsSection";
import ExamplesSection from "./components/ExamplesSection";
import FAQSection from "./components/FAQSection";
import Footer from "./components/Footer";
import GridBackground from "./components/GridBackground";
import SpeedGauge from "./components/SpeedGauge";

export default function Home() {
  const [statsVisible, setStatsVisible] = useState<boolean>(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      <Navbar />
      <HeroSection onScrollToSection={handleScrollToSection} GridBackground={GridBackground} SpeedGauge={SpeedGauge} />
      <SpecsSection />
      <HowItWorksSection />
      <div ref={statsRef}>
        <StatsSection statsVisible={statsVisible} />
      </div>
      <ExamplesSection />
      <FAQSection />
      <Footer />
    </div>
  );
}