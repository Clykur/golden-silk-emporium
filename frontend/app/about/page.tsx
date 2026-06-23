"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { EDITORIAL_IMAGES } from "@/lib/media";
import { useState, useEffect } from "react";

const CAROUSEL_IMAGES = [
  "/images/about-carousel/media__1781995905592.png",
  "/images/about-carousel/media__1781995917159.png",
  "/images/about-carousel/media__1781995927296.png",
  "/images/about-carousel/media__1781995941751.png",
];

export default function AboutUs() {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      {/* Hero */}
      <div
        data-hero-section
        className="relative h-[50svh] min-h-[350px] w-full bg-ink text-background flex items-center justify-center overflow-hidden"
      >
        {CAROUSEL_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="Drapeva Saree Collection"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === bgIndex ? "opacity-45" : "opacity-0"}`}
          />
        ))}

        <div className="absolute inset-0 bg-background/20" />

        <div className="relative text-center z-10 px-4">
          <p className="eyebrow text-background">About Drapeva</p>

          <h1 className="mt-3 font-display text-4xl md:text-6xl text-background">
            Comfort in Every Drape
          </h1>
        </div>
      </div>

      <div className="container-luxe py-24 md:py-32 space-y-28 md:space-y-36">
        {/* Section 1: The Craft */}
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <p className="eyebrow text-gold font-bold tracking-[0.25em] text-[0.7rem] uppercase">
              The Art of Drape
            </p>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-ink font-semibold tracking-wide">
              Where Heritage <br />
              <span className="font-serif italic font-light text-muted-foreground">
                Meets Modernity
              </span>
            </h2>

            <div className="space-y-6 text-sm text-muted-foreground/95 leading-[1.8] font-medium max-w-xl">
              <p>
                Drapeva is an online destination for women seeking elegant, comfortable, and
                timeless sarees. We bring together carefully selected collections from trusted
                brands and sellers, making it easier to discover styles that suit every occasion.
              </p>

              <blockquote className="border-l-2 border-gold pl-5 py-2 font-serif italic text-base text-ink/80 my-8">
                "We partner directly with over 500 weaver families, ensuring fair wages and helping
                preserve weaving techniques that are in danger of being lost to machine looms."
              </blockquote>

              <p>
                From festive celebrations and weddings to everyday elegance, our goal is to offer a
                seamless shopping experience with quality selections, transparent pricing, and
                dependable service.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[380px] aspect-[3/4] overflow-hidden bg-champagne/10 border border-border/60 shadow-lg">
              <img
                src="/images/saree_festive.png"
                alt="Drapeva Saree Collection"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
            {/* Overlapping detailed image */}
            <div className="hidden md:block absolute -bottom-8 md:-left-8 w-[50%] aspect-square border-[6px] border-background overflow-hidden bg-background shadow-2xl">
              <img
                src="/images/saree_wedding.png"
                alt="Saree details"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Our Philosophy */}
        <div className="grid gap-16 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5 relative order-2 lg:order-1 flex justify-center lg:justify-start">
            <div className="w-full max-w-[380px] aspect-[3/4] overflow-hidden bg-champagne/10 border border-border/60 shadow-lg">
              <img
                src="/images/saree_founder.png"
                alt="Founder of Drapeva"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Elegant overlay caption */}
            <div className="absolute bottom-4 right-4 bg-background/90 border border-border/80 px-4 py-2.5 backdrop-blur-sm text-[10px] uppercase tracking-widest text-ink font-semibold">
              drapeva aesthetics
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-8 space-y-8 order-1 lg:order-2">
            <p className="eyebrow text-gold font-bold tracking-[0.25em] text-[0.7rem] uppercase">
              Our Vision
            </p>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] text-ink font-semibold tracking-wide">
              Style, Comfort <br />
              <span className="font-serif italic font-light text-muted-foreground">
                & Confidence
              </span>
            </h2>

            <div className="space-y-6 text-sm text-muted-foreground/95 leading-[1.8] font-medium max-w-xl">
              <p>
                We believe a saree should not only look beautiful but also feel comfortable to wear.
                That's why every collection on Drapeva is chosen with attention to quality, fabric,
                design, and value.
              </p>

              <p>
                Whether you're shopping for a special event or updating your wardrobe, our
                collections are curated to help you find the perfect drape with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Call to Action Card */}
        <div className="relative bg-champagne/15 border border-border p-6 sm:p-12 md:p-20 text-center max-w-4xl mx-auto overflow-hidden shadow-soft">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <p className="eyebrow text-gold font-bold tracking-[0.2em] text-[0.65rem]">
              Why Choose Drapeva
            </p>

            <h3 className="font-display text-3xl md:text-4xl text-ink max-w-xl mx-auto leading-snug">
              A Better Way to Shop Sarees Online
            </h3>

            <p className="text-sm text-muted-foreground/90 leading-relaxed max-w-2xl mx-auto font-medium">
              We focus on offering thoughtfully curated collections, a smooth shopping experience,
              secure ordering, and customer-first service. Every saree is selected to help you
              discover styles that blend elegance, comfort, and value.
            </p>

            <div className="pt-6">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold border-b border-foreground pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
