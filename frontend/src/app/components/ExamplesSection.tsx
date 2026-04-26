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

export default function ExamplesSection() {
  return (
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
  );
}