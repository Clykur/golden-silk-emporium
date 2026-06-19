import { Link } from "@tanstack/react-router";
import { Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border bg-champagne/40">
      <div className="container-luxe py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-3xl tracking-[0.2em]">MAAYA</span>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              An atelier of heirloom Indian silk sarees — handwoven, hand-finished, and quietly
              contemporary. Crafted in India since 1998.
            </p>
            <form className="mt-8 flex max-w-sm border-b border-foreground/30 pb-2">
              <input
                type="email"
                placeholder="Your email for early access"
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <button className="eyebrow text-foreground hover:text-gold transition-colors">
                Join →
              </button>
            </form>
          </div>

          {[
            {
              title: "Shop",
              links: [
                { label: "Shop All", to: "/shop" as const, search: {} },
                { label: "Kanjivaram Sarees", to: "/shop" as const, search: { category: "kanjivaram-sarees" } },
                { label: "Banarasi Sarees", to: "/shop" as const, search: { category: "banarasi-sarees" } },
                { label: "Bridal Sarees", to: "/shop" as const, search: { category: "bridal-sarees" } },
                { label: "New Arrivals", to: "/new-arrivals" as const, search: {} },
              ],
            },
            {
              title: "Atelier",
              links: [
                { label: "Our Story", to: "/about" as const, search: {} },
                { label: "Craftsmanship", to: "/about" as const, search: {} },
                { label: "Lookbook", to: "/lookbook" as const, search: {} },
                { label: "Journal", to: "/shop" as const, search: {} },
              ],
            },
            {
              title: "Service",
              links: [
                { label: "WhatsApp Concierge", to: "/book-appointment" as const, search: {} },
                { label: "Shipping & Returns", to: "/support" as const, search: {} },
                { label: "Care Guide", to: "/support" as const, search: {} },
                { label: "Contact", to: "/support" as const, search: {} },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow text-foreground">{col.title}</h4>
              <ul className="mt-6 space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      search={link.search}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Maaya Couture. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-foreground inline-flex items-center gap-1.5">
              <Instagram className="h-4 w-4" /> @maaya.couture
            </a>
            <a href="#" className="hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
