"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

const occasions = [
  {
    title: "Everyday Elegance",
    image: "/images/saree_wedding.png",
    href: "/collections?category=everyday",
  },
  {
    title: "Festive Collection",
    image: "/images/saree_festive.png",
    href: "/collections?category=festive",
  },
  {
    title: "Office Elegance",
    image: "/images/saree_office.png",
    href: "/collections?category=office",
  },
  {
    title: "Party Wear",
    image: "/images/saree_organza.png",
    href: "/collections?category=party",
  },
];

export function ShopByOccasion() {
  return (
    <section id="collections" className="gsap-section py-24 md:py-32 bg-muted/10">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6 mb-12">
          <div>
            <p className="eyebrow">Curated for you</p>
            <h2 className="mt-3 font-display text-2xl sm:text-3xl md:text-5xl">Shop By Occasion</h2>
          </div>
          <Link
            href="/collections"
            className="eyebrow inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            View all categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 auto-rows-[220px] sm:auto-rows-[280px] md:auto-rows-[350px]">
          {occasions.map((occ, idx) => {
            // Determine grid placement based on index
            let spanClass = "md:col-span-1 md:row-span-1";
            if (idx === 0) {
              // Large vertical on the left
              spanClass = "md:col-span-1 md:row-span-2";
            } else if (idx === 3) {
              // Wide horizontal on the bottom right
              spanClass = "md:col-span-2 md:row-span-1";
            }

            return (
              <Link
                key={occ.title}
                href={occ.href}
                className={`group relative overflow-hidden bg-background w-full h-full ${spanClass}`}
              >
                <img
                  src={occ.image}
                  alt={occ.title}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-background">
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl mb-2 tracking-wide transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                    {occ.title}
                  </h3>
                  <div className="overflow-hidden">
                    <p className="eyebrow flex items-center gap-2 transform transition-transform duration-500 translate-y-[150%] group-hover:translate-y-0 text-background/80 text-xs">
                      Explore <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
