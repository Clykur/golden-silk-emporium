import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-champagne/20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="-mt-6">
            <Link
              to="/"
              className="inline-block select-none"
              aria-label="Drapeva home"
            >
              <img
                src="/logo.png"
                alt="Drapeva"
                className="h-36 w-36 rounded-full object-cover"
              />
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
                  to="/shop"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  All Sarees
                </Link>
              </li>

              <li>
                <Link
                  to="/bestsellers"
                  search={{ category: "best-sellers" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Best Sellers
                </Link>
              </li>

              <li>
                <Link
                  to="/shop"
                  search={{ category: "wedding-sarees" }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Collection
                </Link>
              </li>

              <li>
                <Link
                  to="/new-arrivals"
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
                  to="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Shipping Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Returns & Exchanges
                </Link>
              </li>

              <li>
                <Link
                  to="/support"
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
                  to="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="/collections"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Collections
                </Link>
              </li>

              <li>
                <Link
                  to="/wishlist"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Wishlist
                </Link>
              </li>

              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-border" />

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col gap-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Drapeva. All rights reserved.
          </p>

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

            <Link
              to="/support"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>

            <Link
              to="/support"
              className="transition-colors hover:text-foreground"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}