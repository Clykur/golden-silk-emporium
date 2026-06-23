"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeritageStory() {
  return (
    <section className="gsap-section py-24 md:py-32 bg-muted/20 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-foreground/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-foreground/5 rounded-full blur-3xl" />

      <div className="container-luxe relative z-10">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="relative order-2 md:order-1">
            <div className="aspect-[4/5] overflow-hidden w-full md:w-4/5">
              <img
                src="/images/saree_festive.png"
                alt="Artisan weaving"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>

            {/* Overlapping smaller image — hidden on mobile */}
            <div className="hidden md:block absolute -bottom-12 -right-4 w-3/5 aspect-square border-8 border-background overflow-hidden bg-background shadow-2xl">
              <img
                src="/images/saree_wedding.png"
                alt="Thread details"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="order-1 md:order-2 flex flex-col justify-center">
            <p className="eyebrow mb-6">Our Heritage</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 leading-[1.1]">
              Handpicked for Every <br />
              <span className="font-serif italic font-light">Occasion</span>
            </h2>

            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                At Drapeva, we carefully curate sarees from trusted artisans, renowned weaving
                clusters, and quality-focused manufacturers across India. Every piece in our
                collection is selected for its craftsmanship, fabric quality, design, and elegance.
              </p>
              <p>
                Our goal is simple: to bring you exceptional sarees that celebrate India's rich
                textile traditions while offering styles for modern women. From timeless classics to
                contemporary favorites, each saree is chosen to help you look and feel your best.
              </p>
            </div>

            <div className="mt-12">
              <Link
                href="/about"
                className="group inline-flex items-center gap-4 border-b border-foreground pb-2 text-xs tracking-[0.2em] uppercase font-semibold hover:text-foreground/70 transition-colors"
              >
                <span>Read our story</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
