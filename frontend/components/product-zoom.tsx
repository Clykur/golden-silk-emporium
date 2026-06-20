import { useState, useRef } from "react";

type ProductZoomProps = {
  src: string;
  alt: string;
};

export function ProductZoom({ src, alt }: ProductZoomProps) {
  const [zoom, setZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onMouseMove={handleMouseMove}
      className="relative aspect-[3/4] w-full overflow-hidden bg-champagne/40 cursor-zoom-in border border-border"
    >
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-transform duration-200 ${zoom ? "scale-150" : "scale-100"}`}
        style={zoom ? { transformOrigin: `${position.x}% ${position.y}%` } : undefined}
      />

      {/* Visual Instruction Badge */}
      <span className="absolute bottom-4 right-4 bg-ink/75 text-background px-3 py-1.5 text-[9px] uppercase tracking-wider font-semibold">
        Hover to Zoom
      </span>
    </div>
  );
}
