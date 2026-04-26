"use client";

import { useRef, useState, useEffect } from "react";

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

interface StatsProps {
  statsVisible: boolean;
}

export default function StatsSection({ statsVisible }: StatsProps) {
  const stat1 = useCounter(98, 2000, statsVisible);
  const stat2 = useCounter(250000, 2200, statsVisible);
  const stat3 = useCounter(12, 1800, statsVisible);

  return (
    <Section id="stats" className="relative py-24 px-6 bg-slate-900/50">
      <div className="max-w-6xl mx-auto">
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
  );
}