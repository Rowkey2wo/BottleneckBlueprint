"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

export default function FAQSection() {
  const router = useRouter();

  const faqs = [
    { q: "What specs do I need?", a: "Just your CPU (processor), GPU (graphics card), and resolution like 1920x1080. That's it!" },
    { q: "How accurate is it?", a: "Very accurate! We check against thousands of real game tests from actual gamers." },
    { q: "Can you show me FPS at different resolutions?", a: "Yes! You can test at 1920x1080, 1440p, and 4K to see how each affects FPS." },
    { q: "Is it free?", a: "Yes! Totally free. No hidden costs, no signup needed." },
  ];

  return (
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
            onClick={() => router.push("/service")}
            className="inline-block px-10 py-4 text-sm font-bold text-slate-950 bg-[#00D4FF] hover:bg-white transition-colors rounded-lg shadow-lg shadow-[#00D4FF]/30 cursor-pointer"
          >
            Calculate Now
          </button>
        </div>
      </div>
    </Section>
  );
}