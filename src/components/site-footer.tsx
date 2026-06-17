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
              An atelier of heirloom Indian couture — handwoven, hand-finished,
              and quietly contemporary. Crafted in India since 1998.
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
              links: ["Sarees", "Lehengas", "Anarkali", "Bridal", "New Arrivals"],
            },
            {
              title: "Atelier",
              links: ["Our Story", "Craftsmanship", "Made to Measure", "Press", "Journal"],
            },
            {
              title: "Service",
              links: ["WhatsApp Concierge", "Shipping & Returns", "Care Guide", "Sizing", "Contact"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="eyebrow text-foreground">{col.title}</h4>
              <ul className="mt-6 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l}>
                    <Link
                      to="/shop"
                      search={{ category: "all" }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l}
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
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
