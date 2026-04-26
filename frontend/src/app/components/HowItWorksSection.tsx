"use client";

import { useRef, useState, useEffect } from "react";

interface SectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

interface CardProps {
  label: string;
  value: string;
  bar: number;
  color: string;
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

export default function HowItWorksSection() {
  const steps = [
    { num: "1", title: "Enter Your Specs", body: "Tell us your CPU, GPU, and what resolution you play at", color: "#00D4FF" },
    { num: "2", title: "We Calculate", body: "Our tool tests thousands of results and finds your exact FPS", color: "#FF6B35" },
    { num: "3", title: "Get Your Result", body: "See exactly how many frames per second you'll get", color: "#00FF87" },
  ];

  return (
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
  );
}