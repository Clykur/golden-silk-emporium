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

  const getFooterType = (path: string): "none" | "minimal" | "full" => {
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

    // 2. Minimal footer patterns (authenticated customer account / dashboard pages)
    const minimalPatterns = [
      /^\/dashboard(\/.*)?$/,
      /^\/orders(\/.*)?$/,
      /^\/profile(\/.*)?$/,
      /^\/wishlist(\/.*)?$/,
      /^\/settings(\/.*)?$/,
      /^\/addresses(\/.*)?$/,
      /^\/account(\/.*)?$/,
    ];

    if (minimalPatterns.some((pattern) => pattern.test(normalizedPath))) {
      return "minimal";
    }

    return "full";
  };

  const footerType = getFooterType(pathname || "/");

  if (footerType === "none") {
    return null;
  }

  // Show the simple minimal footer on customer account pages or everywhere if the user is logged in
  if (footerType === "minimal" || user) {
    return (
      <footer className="w-full border-t border-border bg-champagne/10 py-6 mt-auto">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Drapeva. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/support" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
              Terms & Conditions
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-20 border-t border-border bg-champagne/20">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="-mt-6">
            <Link
              href={user ? "/dashboard" : "/"}
              className="inline-block select-none"
              aria-label="Drapeva home"
            >
              <img src="/logo.png" alt="Drapeva" className="h-36 w-36 rounded-full object-cover" />
            </Link>

            <h2
              className="mt-5 text-4xl tracking-[0.22em] text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              DRAPEVA
            </h2>

            <a
              href="https://maps.google.com/?q=NPS+School+Road,+Ambedkar+Nagar,+Chikkabellandur,+Mullur,+Karnataka+560035"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block max-w-sm text-sm leading-relaxed text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              NPS School Road, Ambedkar Nagar, Chikkabellandur, Mullur, Karnataka 560035, India
            </a>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Shop
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Sarees
                </Link>
              </li>

              <li>
                <Link
                  href="/bestsellers?category=best-sellers"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Best Sellers
                </Link>
              </li>

              <li>
                <Link
                  href="/shop?category=wedding-sarees"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Collection
                </Link>
              </li>

              <li>
                <Link
                  href="/new-arrivals"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Customer Care
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Returns & Exchanges
                </Link>
              </li>

              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Company
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/collections"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Collections
                </Link>
              </li>

              <li>
                <Link
                  href="/wishlist"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  href="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground">
              Social
            </h4>

            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href="https://instagram.com/drapeva"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </li>

              <li>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FaWhatsapp className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>

              <li>
                <a
                  href="https://youtube.com/@drapeva"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube
                </a>
              </li>

              <li>
                <a
                  href="https://threads.net/@drapeva"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <FaThreads className="h-4 w-4" />
                  Threads
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-border" />

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Drapeva. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <a href="" className="flex items-center gap-2 transition-colors hover:text-foreground">
              <FaWhatsapp className="h-5 w-5" />
              Whatsapp
            </a>
            <a
              href="https://instagram.com/drapeva"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>

            <Link href="/support" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>

            <Link href="/support" className="transition-colors hover:text-foreground">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
