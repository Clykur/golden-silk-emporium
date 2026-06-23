"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

const fabrics = [
  {
    id: "kanjivaram",
    name: "Kanjivaram Silk",
    description:
      "Known for their rich colors and heavy gold zari borders, Kanjivaram sarees are the magnificent queens of South Indian silk.",
    feel: "Heavy, crisp, and structured",
    occasion: "Weddings, Grand Festivals",
    image: "/images/saree_wedding.png",
  },
  {
    id: "banarasi",
    name: "Banarasi Brocade",
    description:
      "Featuring intricate floral and foliate motifs, Banarasi sarees are masterpieces of Mughal-inspired weaving.",
    feel: "Lustrous, heavy, and ornate",
    occasion: "Bridal Wear, Receptions",
    image: "/images/saree_festive.png",
  },
  {
    id: "organza",
    name: "Pure Organza",
    description:
      "Lightweight and sheer with a subtle sheen, Organza brings a modern, airy elegance to traditional silhouettes.",
    feel: "Crisp, sheer, and feather-light",
    occasion: "Cocktail Parties, Summer Events",
    image: "/images/saree_organza.png",
  },
  {
    id: "cotton-silk",
    name: "Cotton Silk",
    description:
      "The perfect blend of breathable cotton and lustrous silk, offering all-day comfort without compromising on elegance.",
    feel: "Soft, breathable, and slightly crisp",
    occasion: "Office Wear, Day Events",
    image: "/images/saree_office.png",
  },
];

export function FabricDiscovery() {
  const [activeId, setActiveId] = useState(fabrics[0].id);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-40% 0px -40% 0px", // Trigger when element is near the middle of the viewport
      },
    );

    const elements = document.querySelectorAll(".fabric-scroll-item");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const activeFabric = fabrics.find((f) => f.id === activeId) || fabrics[0];

  return (
    <section className="gsap-section bg-foreground text-background relative">
      <div className="container-luxe" ref={containerRef}>
        <div className="flex flex-col items-start relative">
          {/* Left: Sticky Image Display — sticky only on md+ */}
          <div className="w-full md:w-1/2 md:sticky md:top-0 h-[50vw] max-h-[60vh] md:h-[100svh] flex items-center py-8 md:py-24">
            <div className="relative aspect-[3/4] w-full h-full overflow-hidden bg-background/5">
              {fabrics.map((fabric) => (
                <img
                  key={fabric.id}
                  src={fabric.image}
                  alt={fabric.name}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
                    activeId === fabric.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-xs uppercase tracking-[0.2em] mb-2 font-medium">The Texture</p>
                <p className="font-display text-2xl">{activeFabric.name}</p>
              </div>
            </div>
          </div>

          {/* Right: Scrolling Content */}
          <div className="w-full md:w-1/2 md:pl-12 lg:pl-24 pt-8 md:pt-[30vh] pb-[30vh]">
            <p className="eyebrow mb-6 text-background/60">Fabric Guide</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-12 md:mb-24">
              Discover Our
              <br />
              Signature Weaves
            </h2>

            <div className="flex flex-col gap-16 md:gap-32 border-l border-background/20 pl-4 sm:pl-6 md:pl-10 relative">
              {/* Animated active indicator */}
              <div
                className="absolute left-[-1px] w-[2px] bg-background transition-all duration-500"
                style={{
                  top: `${fabrics.findIndex((f) => f.id === activeId) * (100 / fabrics.length)}%`,
                  height: `${100 / fabrics.length}%`,
                }}
              />

              {fabrics.map((fabric) => (
                <div
                  id={fabric.id}
                  key={fabric.id}
                  className={`fabric-scroll-item transition-opacity duration-500 min-h-[25vh] flex flex-col justify-center ${
                    activeId === fabric.id ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <h3 className="font-display text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6">
                    {fabric.name}
                  </h3>
                  <div className="overflow-hidden">
                    <p className="text-base leading-relaxed text-background/80 mb-8 pr-4">
                      {fabric.description}
                    </p>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="uppercase tracking-widest text-background/50 mb-2 text-xs">
                          Feel
                        </p>
                        <p className="font-medium">{fabric.feel}</p>
                      </div>
                      <div>
                        <p className="uppercase tracking-widest text-background/50 mb-2 text-xs">
                          Occasion
                        </p>
                        <p className="font-medium">{fabric.occasion}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
