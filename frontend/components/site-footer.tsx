"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Youtube } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FaThreads } from "react-icons/fa6";
import { useAuth } from "@/lib/auth-store";

export function SiteFooter() {
  const pathname = usePathname();
  const { user } = useAuth();

  const getFooterType = (path: string): "none" | "full" => {
    const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");

    // 1. Hide footer completely
    const hidePatterns = [
      /^\/login$/,
      /^\/register$/,
      /^\/forgot-password$/,
      /^\/reset-password$/,
      /^\/otp$/,
      /^\/verify$/,
      /^\/checkout(\/.*)?$/,
      /^\/payment-processing(\/.*)?$/,
      /^\/admin(\/.*)?$/,
      /^\/access-denied$/,
      /^\/maintenance$/,
    ];

    if (hidePatterns.some((pattern) => pattern.test(normalizedPath))) {
      return "none";
    }

    return "full";
  };

  const footerType = getFooterType(pathname || "/");

  if (footerType === "none") {
    return null;
  }

  return (
    <footer className="mt-20 border-t-0 bg-ink text-background">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col items-start pr-8">
            <Link href="/" className="inline-block select-none group" aria-label="Drapeva home">
              <div className="relative rounded-full overflow-hidden h-32 w-32 border border-background/20 p-2 transition-transform duration-700 group-hover:scale-105">
                <img
                  src="/media/logo.png"
                  alt="Drapeva"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </Link>

            <h2
              className="mt-8 text-3xl tracking-[0.3em] text-background uppercase"
              style={{ fontFamily: "'limelight', serif" }}
            >
              DRAPEVA
            </h2>

            <a
              href="https://www.google.com/maps/place/NPS+School+Rd,+Karnataka+560035/@12.9043695,77.7132067,905m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bae12c487865af7:0x20bf39759c1a8694!8m2!3d12.9043695!4d77.7157816!16s%2Fg%2F11t5cv9ypp?entry=ttu&g_ep=EgoyMDI2MDYxNi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block max-w-sm text-sm leading-loose text-background/60 font-light hover:text-background transition-colors cursor-pointer"
            >
              NPS School Road, Ambedkar Nagar,
              <br />
              Chikkabellandur, Mullur,
              <br />
              Karnataka 560035, India
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-background/40 mb-8">
              Collection
            </h4>

            <ul className="space-y-4">
              <li>
                <Link
                  href="/collections"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  All Sarees
                </Link>
              </li>
              <li>
                <Link
                  href="/bestsellers?category=best-sellers"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/collections?category=wedding-sarees"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Collection
                </Link>
              </li>
              <li>
                <Link
                  href="/new-arrivals"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-background/40 mb-8">
              Customer Care
            </h4>

            <ul className="space-y-4">
              <li>
                <Link
                  href="/support"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-background/40 mb-8">
              Company
            </h4>

            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[10px] font-medium uppercase tracking-[0.3em] text-background/40 mb-8">
              Social
            </h4>

            <ul className="space-y-4">
              <li>
                <a
                  href="https://instagram.com/drapeva"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  <Instagram className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  <FaWhatsapp className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="https://youtube.com/@drapeva"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  <Youtube className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href="https://threads.net/@drapeva"
                  target="_blank"
                  rel="noreferrer"
                  className="group inline-flex items-center gap-3 text-sm font-light text-background/70 transition-colors hover:text-background"
                >
                  <FaThreads className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                  Threads
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-24 border-t border-background/10" />

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col gap-6 text-[11px] uppercase tracking-widest text-background/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Drapeva. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-8">
            <a
              href="https://wa.me/919949740776"
              className="flex items-center gap-2 transition-colors hover:text-background"
            >
              <FaWhatsapp className="h-6 w-6" />
            </a>
            <a
              href="https://instagram.com/drapeva"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-background"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              href="https://threads.net/@drapeva"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 text-sm font-light text-background/70 transition-colors hover:text-background"
            >
              <FaThreads className="h-6 w-6 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href="https://youtube.com/@drapeva"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-3 text-sm font-light text-background/70 transition-colors hover:text-background"
            >
              <Youtube className="h-6 w-6 opacity-60 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>

      {/* Large Footer Marquee */}
      <div className="bg-background text-ink overflow-hidden h-16 md:h-24 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap text-2xl md:text-4xl tracking-[0.32em] uppercase font-limelight">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-16 px-8 items-center">
              <span className="pt-2">DRAPEVA</span>
              <img
                src="/media/correct.png"
                alt="*"
                className="h-8 w-8 md:h-10 md:w-10 opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
