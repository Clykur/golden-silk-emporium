import { useState, useRef } from "react";
import { RotateCw } from "lucide-react";

type Product360ViewerProps = {
  images: string[];
};

export function Product360Viewer({ images }: Product360ViewerProps) {
  const [index, setIndex] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || images.length === 0) return;
    const deltaX = e.clientX - startX.current;

    // Rotate every 15px of horizontal drag
    if (Math.abs(deltaX) > 15) {
      const step = deltaX > 0 ? 1 : -1;
      setIndex((prev) => (prev + step + images.length) % images.length);
      startX.current = e.clientX;
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative aspect-[3/4] w-full select-none overflow-hidden bg-champagne/40 cursor-grab active:cursor-grabbing border border-border"
      style={{ perspective: "1000px" }}
    >
      <img
        src={images[index]}
        alt="Product 360 view"
        className="h-full w-full object-cover pointer-events-none transition-transform duration-300 ease-out"
        style={{
          transform: `scale(1.05) rotateY(${(index - images.length / 2) * 12}deg)`,
        }}
      />

      {/* 360 Badge Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-ink/75 text-background px-3 py-1.5 text-[9px] uppercase tracking-wider font-semibold rounded-full">
        <RotateCw className="h-3.5 w-3.5 animate-spin-slow" /> 360° View
      </div>

      <div className="absolute bottom-4 inset-x-4 text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest bg-background/80 py-1.5 inline-block px-4">
          Drag horizontally to rotate
        </p>
      </div>
    </div>
  );
}
