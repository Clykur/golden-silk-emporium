"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductCarousel } from "@/components/product-carousel";
import { productsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-store";
import { useProductsStore } from "@/lib/products-store";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { HeroSection } from "@/components/home/hero-section";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { ShopByOccasion } from "@/components/home/shop-by-occasion";
import { FabricDiscovery } from "@/components/home/fabric-discovery";
import { VideoCommerce } from "@/components/home/video-commerce";
import { HeritageStory } from "@/components/home/heritage-story";
import { StyleGallery } from "@/components/home/style-gallery";
import { PremiumPackaging } from "@/components/home/premium-packaging";

import { FounderStory } from "@/components/home/founder-story";
import { FaqAccordion } from "@/components/home/faq-accordion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-muted/10" />
      <div className="mt-3 h-3 w-3/4 bg-muted/10 rounded" />
      <div className="mt-2 h-3 w-1/2 bg-muted/10 rounded" />
    </div>
  );
}

// ====
// PUBLIC HOME PAGE (For Guests)
// ============================================================
function PublicHome() {
  const containerRef = useRef<HTMLDivElement>(null);
  const newArrivals = useProductsStore((state) => state.newArrivals).slice(0, 8);
  const bestsellers = useProductsStore((state) => state.bestsellers).slice(0, 8);
  const [loading, setLoading] = useState(newArrivals.length === 0 || bestsellers.length === 0);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          useProductsStore.getState().fetchNewArrivals(8),
          useProductsStore.getState().fetchBestsellers(8),
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useGSAP(
    () => {
      const sections = gsap.utils.toArray(".gsap-section");
      sections.forEach((section: any) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef}>
      <HeroSection />

      {/* NEW ARRIVALS */}
      <section
        id="new-arrivals"
        className="gsap-section container-luxe pb-24 md:pb-32 pt-24 border-t border-border"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Just in</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">New arrivals</h2>
          </div>
          <Link
            href="/collections"
            className="eyebrow inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            See more <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductCarousel products={newArrivals} loading={loading} />
      </section>

      <ShopByOccasion />
      <WhyChooseUs />
      <FabricDiscovery />

      {/* BESTSELLERS */}
      <section
        id="bestsellers"
        className="gsap-section container-luxe py-24 md:pb-32 border-t border-border"
      >
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="eyebrow">Most loved</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Bestsellers</h2>
          </div>
          <Link
            href="/collections"
            className="eyebrow inline-flex items-center gap-2 hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ProductCarousel products={bestsellers} loading={loading} />
      </section>

      <VideoCommerce />
      <HeritageStory />
      <PremiumPackaging />
      <StyleGallery />
      <FounderStory />
      <FaqAccordion />
    </div>
  );
}

// ====
// MAIN CONTAINER COMPONENT
// ============================================================
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Removed redirect logic so users can browse the homepage when logged in

  // Loading skeleton state
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-foreground" />
      </div>
    );
  }

  return <PublicHome />;
}
