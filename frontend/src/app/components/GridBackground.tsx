export default function GridBackground() {
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