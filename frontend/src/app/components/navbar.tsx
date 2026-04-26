"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    
    // If it's a hash link to a section
    if (href.startsWith("#")) {
      const element = document.getElementById(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If it's a route
      router.push(href);
    }
  };

  const navLinks = [
    { label: "Home", href: "#hero" },
    { label: "Features", href: "#specs" },
    { label: "How It Works", href: "#how" },
    { label: "Benchmarks", href: "#examples" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#050A14]/90 backdrop-blur-md border-b border-[#00D4FF]/20 shadow-[0_0_30px_rgba(0,212,255,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => handleNavClick("#hero")}
          className="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="relative w-10 h-10">
            {/* Hexagon logo */}
            <svg viewBox="0 0 40 40" className="w-10 h-10">
              <polygon
                points="20,2 36,11 36,29 20,38 4,29 4,11"
                fill="none"
                stroke="#00D4FF"
                strokeWidth="1.5"
                className="transition-all duration-300 group-hover:stroke-[#FF6B35]"
              />
              <polygon
                points="20,8 30,14 30,26 20,32 10,26 10,14"
                fill="#00D4FF"
                fillOpacity="0.1"
                className="transition-all duration-300 group-hover:fill-[#FF6B35]"
              />
              <text
                x="20"
                y="24"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#00D4FF"
                fontFamily="monospace"
                className="transition-all duration-300 group-hover:fill-[#FF6B35]"
              >
                BB
              </text>
            </svg>
            <div className="absolute inset-0 rounded-full bg-[#00D4FF]/10 blur-sm group-hover:bg-[#FF6B35]/10 transition-all duration-300" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[10px] font-mono text-[#00D4FF]/70 tracking-[0.2em] uppercase">
              The
            </span>
            <span className="text-sm font-bold text-white tracking-wide font-mono">
              Bottleneck
            </span>
            <span className="text-[10px] font-mono text-[#FF6B35] tracking-[0.15em] uppercase">
              Blueprint
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-mono text-[#8BA8C4] hover:text-[#00D4FF] transition-colors duration-200 tracking-wider uppercase relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#00D4FF] group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => router.push("/service")}
            className="relative px-5 py-2 text-sm font-mono font-semibold text-[#050A14] bg-[#00D4FF] hover:bg-[#FF6B35] transition-colors duration-300 tracking-wider uppercase overflow-hidden group cursor-pointer"
            style={{ clipPath: "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)" }}
          >
            <span className="relative z-10">Analyze My PC →</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#00D4FF] p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#050A14]/95 backdrop-blur-md border-t border-[#00D4FF]/20 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-mono text-[#8BA8C4] hover:text-[#00D4FF] transition-colors tracking-wider uppercase py-2 border-b border-[#00D4FF]/10 text-left cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push("/service");
            }}
            className="mt-2 text-center px-5 py-2.5 text-sm font-mono font-semibold text-[#050A14] bg-[#00D4FF] hover:bg-[#FF6B35] transition-colors duration-300 tracking-wider uppercase cursor-pointer"
          >
            Analyze My PC →
          </button>
        </div>
      )}
    </nav>
  );
}