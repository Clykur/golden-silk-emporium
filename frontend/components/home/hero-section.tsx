"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_VIDEO, HERO_POSTER } from "@/lib/media";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Parallax effect for the background video/image
      gsap.to(".hero-media", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Text entrance animation
      gsap.fromTo(
        ".hero-text-line",
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          stagger: 0.2,
          ease: "power4.out",
          delay: 0.2,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative h-[calc(100svh-50px)] w-full overflow-hidden bg-foreground text-background"
      data-hero-section
    >
      <div className="hero-media absolute inset-0 h-[120%] w-full -top-[10%]">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover opacity-80"
          poster={HERO_POSTER}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="container-luxe relative z-10 flex h-full flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-4xl">
          <p className="hero-text-line eyebrow flex items-center gap-3 text-background/80 mb-6">
            Since 2026
          </p>
          <h1 className="hero-text-line font-display text-4xl leading-[1.1] md:text-8xl lg:text-[100px] tracking-tight">
            Comfort in Every
            <br />
            <span className="font-serif italic font-light">Drape.</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-background/80 font-light">
            Discover our curated selection of premium sarees, where traditional craftsmanship meets
            modern luxury.
          </p>
          <div className="hero-text-line mt-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <a
              href="#collections"
              className="group inline-flex items-center gap-4 bg-background text-foreground px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-background/90 transition-colors"
            >
              <span className="font-semibold">Explore Collections</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Marquee */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-ink text-background overflow-hidden h-10 flex items-center border-t border-border/20">
        <div className="flex animate-marquee whitespace-nowrap text-[0.7rem] tracking-[0.32em] uppercase font-limelight">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-12 px-6 items-center">
              <span className="pt-1">DRAPEVA</span>
              <img src="/media/correct.png" alt="*" className="h-3.5 w-3.5 invert brightness-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
