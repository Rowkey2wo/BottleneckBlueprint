"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "./components/navbar";

/* Simple counter that goes up */
function useCounter(target: number, duration: number = 2000, start: boolean = false): number {
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* Cool animated background */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00D4FF" strokeWidth="0.5" />
          </pattern>
          <pattern id="grid-large" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#grid)" />
            <path d="M 200 0 L 0 0 0 200" fill="none" stroke="#00D4FF" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full bg-[#00D4FF]/5 blur-[120px]" />
      <div className="absolute top-2/3 right-1/4 w-100 h-100 rounded-full bg-[#FF6B35]/5 blur-[100px]" />
    </div>
  );
}

/* Info card component */
interface CardProps {
  label: string;
  value: string;
  bar: number;
  color: string;
}

function Card({ label, value, bar, color }: CardProps) {
  return (
    <div className="border border-[#1E293B]/40 bg-[#0F172A]/60 p-4 hover:border-[#00D4FF]/60 transition-all duration-300 rounded-lg">
      <p className="text-xs text-[#94A3B8] mb-1 uppercase font-semibold">{label}</p>
      <p className="text-lg font-bold text-white mb-2">{value}</p>
      <div className="h-2 bg-[#1E293B] overflow-hidden rounded">
        <div className="h-full transition-all duration-1000" style={{ width: `${bar}%`, background: color }} />
      </div>
      <p className="text-[10px] text-right mt-1 font-semibold" style={{ color }}>{bar}%</p>
    </div>
  );
}

/* Section that fades in when you scroll */
interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function Section({ id, children, className = "" }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState<boolean>(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </section>
  );
}

/* Speed gauge */
interface GaugeProps {
  fps: number;
  label: string;
}

function SpeedGauge({ fps, label }: GaugeProps) {
  const fill = Math.min(fps / 300, 1);
  const angle = -135 + fill * 270;
  const color = fps >= 144 ? "#00FF87" : fps >= 60 ? "#00D4FF" : fps >= 30 ? "#FFD700" : "#FF4444";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-28 h-28 relative">
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <path d="M 15 95 A 55 55 0 1 1 105 95" fill="none" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 15 95 A 55 55 0 1 1 105 95"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${fill * 260} 260`}
            className="transition-all duration-1000"
          />
          <line
            x1="60" y1="60"
            x2={60 + 35 * Math.cos(((angle - 90) * Math.PI) / 180)}
            y2={60 + 35 * Math.sin(((angle - 90) * Math.PI) / 180)}
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="60" r="4" fill={color} />
          <text x="60" y="88" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" fontFamily="monospace">{fps}</text>
          <text x="60" y="100" textAnchor="middle" fontSize="8" fill="#94A3B8" fontFamily="monospace">FPS</text>
        </svg>
      </div>
      <p className="text-xs text-[#94A3B8] text-center font-medium">{label}</p>
    </div>
  );
}

/* Main page */
export default function Home() {
  const router = useRouter();
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

  const stat1 = useCounter(98, 2000, statsVisible);
  const stat2 = useCounter(250000, 2200, statsVisible);
  const stat3 = useCounter(12, 1800, statsVisible);

  const specs = [
    { 
      title: "Processor (CPU)", 
      desc: "Your computer's brain. Affects how many frames you get.",
      color: "#00D4FF" 
    },
    { 
      title: "Graphics Card (GPU)", 
      desc: "Makes your games look good. More powerful = more FPS.",
      color: "#FF6B35" 
    },
    { 
      title: "Resolution", 
      desc: "How many pixels on your screen. Higher = prettier but slower.",
      color: "#00FF87" 
    },
  ];

  const steps = [
    { num: "1", title: "Enter Your Specs", body: "Tell us your CPU, GPU, and what resolution you play at", color: "#00D4FF" },
    { num: "2", title: "We Calculate", body: "Our tool tests thousands of results and finds your exact FPS", color: "#FF6B35" },
    { num: "3", title: "Get Your Result", body: "See exactly how many frames per second you'll get", color: "#00FF87" },
  ];

  const faqs = [
    { q: "What specs do I need?", a: "Just your CPU (processor), GPU (graphics card), and resolution like 1920x1080. That's it!" },
    { q: "How accurate is it?", a: "Very accurate! We check against thousands of real game tests from actual gamers." },
    { q: "Can you show me FPS at different resolutions?", a: "Yes! You can test at 1920x1080, 1440p, and 4K to see how each affects FPS." },
    { q: "Is it free?", a: "Yes! Totally free. No hidden costs, no signup needed." },
  ];

  const handleCalculateFPS = () => {
    router.push("/service");
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
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
              onClick={() => handleScrollToSection("how")}
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

      {/* Specs Section */}
      <Section id="specs" className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-[#FF6B35] tracking-[0.4em] uppercase mb-3">What We Check</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The 3 Things That Matter
            </h2>
            <p className="text-[#CBD5E1] max-w-xl mx-auto text-lg">
              These three components control your gaming FPS. Everything else is extra.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specs.map((spec, i) => (
              <div key={i} className="border border-[#1E293B] bg-slate-800/40 p-8 hover:border-[#1E293B]/60 hover:bg-slate-800/60 transition-all rounded-lg backdrop-blur-sm">
                <div className="w-12 h-12 rounded-lg mb-4" style={{ background: `${spec.color}20`, borderLeft: `3px solid ${spec.color}` }}></div>
                <h3 className="text-2xl font-bold text-white mb-3">{spec.title}</h3>
                <p className="text-[#CBD5E1] text-base leading-relaxed">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section id="how" className="relative py-24 px-6 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-[#00D4FF] tracking-[0.4em] uppercase mb-3">Our Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="w-16 h-16 flex items-center justify-center border-2 mb-6 text-2xl font-bold text-white rounded-lg"
                  style={{ borderColor: s.color, background: `${s.color}15` }}
                >
                  {s.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-[#CBD5E1] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 border border-[#1E293B] bg-slate-800/40 p-6 rounded-lg backdrop-blur-sm">
            <p className="text-xs text-[#64748B] mb-4 uppercase font-bold tracking-wider">Example: Check Your FPS</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <Card label="CPU" value="Intel i5-13600K" bar={85} color="#00D4FF" />
              <Card label="GPU" value="RTX 4060 Ti" bar={75} color="#FF6B35" />
              <Card label="Resolution" value="1920 x 1080" bar={90} color="#00FF87" />
            </div>
            <div className="border-l-4 border-[#00FF87] bg-[#00FF87]/5 p-4 rounded">
              <p className="text-sm text-[#CBD5E1] font-semibold">
                Result: You can get around 85-95 FPS at 1920x1080 in most modern games
              </p>
              <p className="text-xs text-[#94A3B8] mt-2">
                This is based on real test results from thousands of gamers with similar setups.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section id="stats" className="relative py-24 px-6 bg-slate-900/50">
        <div ref={statsRef} className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-[#FF6B35] tracking-[0.4em] uppercase mb-3">Real Data</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powered by Real Tests
            </h2>
            <p className="text-[#CBD5E1] max-w-xl mx-auto text-lg">
              All our calculations are based on actual test results, not guesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { val: stat1, suffix: "%", label: "Accuracy Rate", sub: "Compared to real tests", color: "#00D4FF" },
              { val: stat2.toLocaleString(), suffix: "+", label: "Test Results", sub: "CPU & GPU combos", color: "#FF6B35" },
              { val: stat3, suffix: "ms", label: "Time to Result", sub: "Get FPS instantly", color: "#00FF87" },
            ].map((s, i) => (
              <div key={i} className="border border-[#1E293B] bg-slate-800/40 p-8 text-center hover:border-[#1E293B]/60 hover:bg-slate-800/60 transition-all rounded-lg backdrop-blur-sm">
                <div className="text-5xl font-bold mb-2" style={{ color: s.color }}>
                  {s.val}{s.suffix}
                </div>
                <p className="text-lg font-bold text-white mb-1">{s.label}</p>
                <p className="text-xs font-mono text-[#64748B] uppercase font-semibold">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FPS Comparison Table */}
      <Section id="examples" className="relative py-24 px-6 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-[#00FF87] tracking-[0.4em] uppercase mb-3">Examples</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              FPS Results by Resolution
            </h2>
            <p className="text-[#CBD5E1] max-w-xl mx-auto text-lg">
              See how FPS changes at different resolutions with the same PC.
            </p>
          </div>

          <div className="border border-[#1E293B] bg-slate-800/40 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-950 border-b border-[#1E293B]">
                    <th className="px-6 py-4 text-left font-bold text-[#94A3B8] uppercase text-xs tracking-wide">Setup</th>
                    <th className="px-6 py-4 text-center font-bold text-[#94A3B8] uppercase text-xs tracking-wide">1920x1080</th>
                    <th className="px-6 py-4 text-center font-bold text-[#94A3B8] uppercase text-xs tracking-wide">1440p</th>
                    <th className="px-6 py-4 text-center font-bold text-[#94A3B8] uppercase text-xs tracking-wide">4K</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { setup: "RTX 4090 + i9-13900K", fps1080: "280", fps1440: "200", fps4k: "120" },
                    { setup: "RTX 4070 + i7-13700K", fps1080: "165", fps1440: "120", fps4k: "70" },
                    { setup: "RTX 4060 + i5-13600K", fps1080: "120", fps1440: "85", fps4k: "45" },
                    { setup: "RTX 3060 + Ryzen 5 5600X", fps1080: "95", fps1440: "70", fps4k: "40" },
                    { setup: "GTX 1660 + i5-10400", fps1080: "75", fps1440: "55", fps4k: "30" },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-[#1E293B]/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-[#CBD5E1]">{row.setup}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#00FF87] font-bold">{row.fps1080} FPS</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#00D4FF] font-bold">{row.fps1440} FPS</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-[#FFD700] font-bold">{row.fps4k} FPS</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section id="faq" className="relative py-24 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-[#00D4FF] tracking-[0.4em] uppercase mb-3">Questions</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Got Questions?
            </h2>
          </div>

          <div className="space-y-3 mb-16">
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div className="border border-[#00D4FF]/30 bg-slate-800/40 p-10 rounded-lg text-center backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Check Your FPS?
            </h3>
            <p className="text-[#CBD5E1] text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Just enter your CPU, GPU, and resolution. Get your exact FPS in seconds!
            </p>
            <button
              onClick={handleCalculateFPS}
              className="inline-block px-10 py-4 text-sm font-bold text-slate-950 bg-[#00D4FF] hover:bg-white transition-colors rounded-lg shadow-lg shadow-[#00D4FF]/30 cursor-pointer"
            >
              Calculate Now
            </button>
          </div>
        </div>
      </Section>

      <footer className="border-t border-[#1E293B] py-8 px-6 text-center bg-slate-950">
        <p className="text-xs text-[#64748B] uppercase font-semibold tracking-wide">
          © 2025 FPS Calculator · For Gamers
        </p>
      </footer>
    </div>
  );
}

/* FAQ Item */
interface FaqItemProps {
  q: string;
  a: string;
}

function FaqItem({ q, a }: FaqItemProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="border border-[#1E293B] bg-slate-800/40 overflow-hidden rounded-lg backdrop-blur-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#00D4FF]/5 transition-colors cursor-pointer"
      >
        <span className="text-base font-bold text-white">{q}</span>
        <span className={`text-[#00D4FF] text-lg font-bold transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all ${open ? "max-h-40" : "max-h-0"}`}>
        <p className="px-6 pb-4 text-sm text-[#CBD5E1] border-t border-[#1E293B] pt-4 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}