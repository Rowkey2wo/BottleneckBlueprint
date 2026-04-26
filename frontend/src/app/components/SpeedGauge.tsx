interface GaugeProps {
    fps: number;
    label: string;
  }
  
  export default function SpeedGauge({ fps, label }: GaugeProps) {
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