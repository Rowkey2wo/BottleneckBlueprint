"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ServicePage() {
  const router = useRouter();
  const [cpu, setCpu] = useState("");
  const [gpu, setGpu] = useState("");
  const [resolution, setResolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const cpuOptions = [
    { value: "i5-13600K", label: "Intel i5-13600K" },
    { value: "i7-13700K", label: "Intel i7-13700K" },
    { value: "ryzen-7-7800X3D", label: "AMD Ryzen 7 7800X3D" },
  ];

  const gpuOptions = [
    { value: "rtx-4060", label: "NVIDIA RTX 4060 Ti" },
    { value: "rtx-4070", label: "NVIDIA RTX 4070" },
    { value: "rtx-4090", label: "NVIDIA RTX 4090" },
  ];

  const resolutionOptions = [
    { value: "1920x1080", label: "1920 x 1080 (Full HD)" },
    { value: "2560x1440", label: "2560 x 1440 (1440p)" },
    { value: "3840x2160", label: "3840 x 2160 (4K)" },
  ];

  const isComplete = cpu && gpu && resolution;

  const handleNext = () => {
    if (!isComplete) return;
    
    setIsLoading(true);
    // Store selections in sessionStorage to pass to chatbot
    sessionStorage.setItem("selectedSpecs", JSON.stringify({ cpu, gpu, resolution }));
    
    // Navigate to chatbot after a short delay for visual feedback
    setTimeout(() => {
      router.push("/service/AIChatBot");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-x-hidden">
      {/* Background Grid */}
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Select Your <span className="text-[#00D4FF]">Specs</span>
            </h1>
            <p className="text-[#CBD5E1] text-lg">
              Choose your processor, graphics card, and resolution to get your FPS results
            </p>
          </div>

          {/* Form Card */}
          <div className="border border-[#1E293B] bg-slate-800/40 backdrop-blur-sm rounded-lg p-8 md:p-12 space-y-6">
            
            {/* CPU Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D4FF]"></span>
                  Processor (CPU)
                </span>
              </label>
              <select
                value={cpu}
                onChange={(e) => setCpu(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-[#1E293B] rounded-lg text-white focus:border-[#00D4FF] focus:outline-none transition-colors cursor-pointer hover:border-[#1E293B]/60"
              >
                <option value="">Select a processor...</option>
                {cpuOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              {cpu && (
                <div className="flex items-center gap-2 text-xs text-[#00FF87]">
                  <span>✓</span>
                  <span>Selected: {cpuOptions.find(o => o.value === cpu)?.label}</span>
                </div>
              )}
            </div>

            {/* GPU Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B35]"></span>
                  Graphics Card (GPU)
                </span>
              </label>
              <select
                value={gpu}
                onChange={(e) => setGpu(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-[#1E293B] rounded-lg text-white focus:border-[#FF6B35] focus:outline-none transition-colors cursor-pointer hover:border-[#1E293B]/60"
              >
                <option value="">Select a graphics card...</option>
                {gpuOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              {gpu && (
                <div className="flex items-center gap-2 text-xs text-[#00FF87]">
                  <span>✓</span>
                  <span>Selected: {gpuOptions.find(o => o.value === gpu)?.label}</span>
                </div>
              )}
            </div>

            {/* Resolution Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white uppercase tracking-wider">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF87]"></span>
                  Resolution
                </span>
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-[#1E293B] rounded-lg text-white focus:border-[#00FF87] focus:outline-none transition-colors cursor-pointer hover:border-[#1E293B]/60"
              >
                <option value="">Select a resolution...</option>
                {resolutionOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
              {resolution && (
                <div className="flex items-center gap-2 text-xs text-[#00FF87]">
                  <span>✓</span>
                  <span>Selected: {resolutionOptions.find(o => o.value === resolution)?.label}</span>
                </div>
              )}
            </div>

            {/* Progress Indicator */}
            <div className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-1 bg-[#1E293B] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-[#00D4FF] to-[#FF6B35] transition-all duration-300"
                    style={{ width: `${(Object.values({ cpu, gpu, resolution }).filter(Boolean).length / 3) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-[#64748B] font-semibold">
                  {Object.values({ cpu, gpu, resolution }).filter(Boolean).length}/3
                </span>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!isComplete || isLoading}
              className={`w-full mt-8 px-6 py-3 font-bold rounded-lg transition-all duration-300 ${
                isComplete && !isLoading
                  ? "bg-[#00D4FF] text-slate-950 hover:bg-white shadow-lg shadow-[#00D4FF]/30 cursor-pointer"
                  : "bg-[#1E293B] text-[#64748B] cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Go to Chat</span>
                  <span>→</span>
                </div>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 border-l-4 border-[#00D4FF] bg-[#00D4FF]/5 p-4 rounded">
            <p className="text-sm text-[#CBD5E1]">
              <span className="font-semibold text-[#00D4FF]">Tip:</span> Choose your exact specs to get the most accurate FPS calculation for your setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}