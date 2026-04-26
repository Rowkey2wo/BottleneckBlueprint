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

export default function SpecsSection() {
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

  return (
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
  );
}