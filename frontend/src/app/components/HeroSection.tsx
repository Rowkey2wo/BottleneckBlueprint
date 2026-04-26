"use client";

import { useRouter } from "next/navigation";

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
  GridBackground: React.ComponentType;
  SpeedGauge: React.ComponentType<{ fps: number; label: string }>;
}

export default function HeroSection({ onScrollToSection, GridBackground, SpeedGauge }: HeroSectionProps) {
  const router = useRouter();

  const handleCalculateFPS = () => {
    router.push("/service");
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6">
      <GridBackground />

      <div className="absolute top-20 left-6 w-16 h-16 border-t-2 border-l-2 border-[#00D4FF]/40" />
      <div className="absolute top-20 right-6 w-16 h-16 border-t-2 border-r-2 border-[#00D4FF]/40" />
      <div className="absolute bottom-8 left-6 w-16 h-16 border-b-2 border-l-2 border-[#FF6B35]/40" />
      <div className="absolute bottom-8 right-6 w-16 h-16 border-b-2 border-r-2 border-[#FF6B35]/40" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-white">
          Check Your <br />
          <span className="text-[#00D4FF]">Gaming FPS</span>
          <br />
          In Seconds
        </h1>

        <p className="text-base md:text-lg text-[#CBD5E1] max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your CPU, GPU, and resolution. We'll show you exactly how many frames per second you'll get in your favorite games!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button
            onClick={handleCalculateFPS}
            className="px-8 py-3 text-sm font-bold text-slate-950 bg-[#00D4FF] hover:bg-white transition-colors rounded-lg shadow-lg shadow-[#00D4FF]/30 cursor-pointer"
          >
            Calculate FPS
          </button>
          <button
            onClick={() => onScrollToSection("how")}
            className="px-8 py-3 text-sm font-bold text-[#00D4FF] border border-[#00D4FF]/40 hover:bg-[#00D4FF]/10 transition-all rounded-lg cursor-pointer"
          >
            How It Works
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          <SpeedGauge fps={200} label="High End PC" />
          <SpeedGauge fps={120} label="Mid Range PC" />
          <SpeedGauge fps={60} label="Budget PC" />
          <SpeedGauge fps={30} label="Low End PC" />
        </div>
      </div>
    </section>
  );
}