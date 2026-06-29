"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const fabrics = [
  {
    id: "kanjivaram",
    name: "Kanjivaram Silk",
    tagline: "The Queen of Silks",
    description:
      "A masterpiece of heritage craftsmanship, Kanjivaram sarees are hand-woven in gold-dipped silver threads. Known for their structured drape, vibrant double-shades, and majestic contrast borders, they embody the pinnacle of South Indian bridal couture.",
    feel: "Heavy, crisp, and structured",
    occasion: "Bridal Wear, Grand Celebrations",
    image: "/images/saree_wedding.png",
  },
  {
    id: "banarasi",
    name: "Banarasi Brocade",
    tagline: "Imperial Mughal Legacy",
    description:
      "Originating from the sacred ghats of Varanasi, Banarasi sarees feature intricate gold and silver brocades (Zari). Woven on traditional wooden looms, their signature floral trails and bootis carry a royal Mughal legacy.",
    feel: "Lustrous, heavy, and ornate",
    occasion: "Weddings, Heritage Receptions",
    image: "/images/saree_festive.png",
  },
  {
    id: "organza",
    name: "Pure Organza",
    tagline: "Whisper of Modern Elegance",
    description:
      "Delicate, sheer, and styled with a subtle ethereal sheen, pure organza brings a contemporary lightness to heritage silhouettes. Hand-embroidered with fine details, it drapes like a soft whisper of wind.",
    feel: "Crisp, sheer, and feather-light",
    occasion: "Atelier Parties, Evening Soirées",
    image: "/images/saree_organza.png",
  },
  {
    id: "cotton-silk",
    name: "Cotton Silk",
    tagline: "Everyday Masterpiece",
    description:
      "The ultimate harmony of comfort and understated luxury. Combining the breathability of premium cotton with the soft sheen of hand-spun silk, this weave ensures all-day comfort without losing its regal poise.",
    feel: "Soft, breathable, and slightly crisp",
    occasion: "Day Atelier, Executive Wear",
    image: "/images/saree_office.png",
  },
];

export function FabricDiscovery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Pinning the section while scrolling through the slides
    const pinTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "+=150%", // Gives sufficient scroll room for 4 slides
      pin: true,
      scrub: 0.4, // Smooth scrolling transition
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const rawProgress = self.progress;
        // Map 0 -> 1 progress to 0 -> 3 indices
        const index = Math.min(fabrics.length - 1, Math.floor(rawProgress * fabrics.length));

        setActiveIndex((prev) => {
          if (index !== prev) {
            setDirection(index > prev ? 1 : -1);
            return index;
          }
          return prev;
        });
      },
    });

    return () => {
      pinTrigger.kill();
    };
  }, []);

  const activeFabric = fabrics[activeIndex];

  // High performance slide up & fade out variants for content
  const textVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: "spring" as const, stiffness: 100, damping: 20 },
        opacity: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: {
        y: { duration: 0.4, ease: "easeIn" as const },
        opacity: { duration: 0.3 },
      },
    }),
  };

  return (
    // Outer scroll container that creates the scroll height
    <div ref={containerRef} className="relative bg-[#0a0a0a] w-full">
      {/* Pinned inner viewport */}
      <section className="h-screen w-full text-white overflow-hidden flex items-center relative">
        {/* Luxury Background details */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:3rem_3rem] md:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container-luxe mx-auto px-4 sm:px-6 md:px-8 lg:px-12 max-w-[1440px] w-full z-10 py-6 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-8 md:gap-12 lg:gap-16">
            {/* LEFT COLUMN: Image display with a high-end landscape aspect ratio */}
            <div className="w-full max-w-[340px] sm:max-w-[400px] md:max-w-[460px] md:w-1/2 flex items-center justify-center">
              <div className="relative w-full aspect-[4/3] md:aspect-[4/3.2] overflow-hidden bg-[#111] border border-gold/15 shadow-2xl shadow-black/80">
                {/* Gold luxury accents on corners */}
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-gold/40 z-20 pointer-events-none" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-gold/40 z-20 pointer-events-none" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-gold/40 z-20 pointer-events-none" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-gold/40 z-20 pointer-events-none" />

                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeFabric.id}
                    src={activeFabric.image}
                    alt={activeFabric.name}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 h-full w-full object-cover filter brightness-[0.85] contrast-[1.02]"
                  />
                </AnimatePresence>

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/25 z-10 pointer-events-none" />

                {/* Floating caption detail */}
                <div className="absolute bottom-4 left-4 right-4 z-20 text-left">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#D4AF37] animate-pulse" />
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-bold text-[#D4AF37]">
                      {activeFabric.tagline}
                    </span>
                  </div>
                  <h3 className="font-display text-sm sm:text-lg md:text-xl text-white tracking-wide leading-tight">
                    {activeFabric.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Vertically Centered storytelling content */}
            <div className="w-full md:w-1/2 flex flex-col justify-center min-h-none md:min-h-[40vh] pl-0 md:pl-8 lg:pl-12">
              {/* Header */}
              <div className="space-y-1 mb-4 md:mb-6 sm:mb-8 text-center md:text-left">
                <span className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] text-gold font-bold block">
                  Atelier Fabric Guide
                </span>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wide text-white leading-tight">
                  Discover Our Collection{" "}
                  <span className="text-gold italic font-normal block md:inline">
                    Signature Weaves
                  </span>
                </h2>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center md:justify-start gap-3">
                {fabrics.map((_, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span
                      className={`text-xs font-semibold transition-colors duration-300 ${
                        index === activeIndex
                          ? "text-[#D4AF37]" // Gold
                          : index < activeIndex
                            ? "text-white/70"
                            : "text-white/30"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {index !== fabrics.length - 1 && (
                      <div className="w-8 h-px bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-gold"
                          initial={{ width: "0%" }}
                          animate={{
                            width: index < activeIndex ? "100%" : "0%",
                          }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <span className="ml-auto md:ml-0 md:mr-auto mt-2 md:mt-0 flex items-center gap-1 text-[8px] uppercase tracking-widest text-white/30">
                Scroll to Discover
                <ArrowDown className="w-2.5 h-2.5 text-gold animate-bounce" />
              </span>

              {/* Text content animating step-by-step in the center */}
              <div className="relative min-h-[150px] md:min-h-[220px] flex items-center overflow-hidden text-center md:text-left">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={activeFabric.id}
                    custom={direction}
                    variants={textVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-3 md:space-y-4 w-full flex flex-col items-center md:items-start"
                  >
                    <h3 className="font-display text-base sm:text-xl md:text-2xl text-white tracking-wide">
                      {activeFabric.name}
                    </h3>

                    <p className="text-[11px] sm:text-xs md:text-sm text-white/70 leading-relaxed max-w-md">
                      {activeFabric.description}
                    </p>

                    {/* Fabric Specifications */}
                    <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-3.5 w-full max-w-md">
                      <div>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 block mb-0.5">
                          Tactile Feel
                        </span>
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-white/95">
                          {activeFabric.feel}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/40 block mb-0.5">
                          Occasion
                        </span>
                        <span className="text-[10px] sm:text-xs md:text-sm font-medium text-white/95">
                          {activeFabric.occasion}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
