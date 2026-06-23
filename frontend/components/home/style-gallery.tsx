"use client";

import { Instagram } from "lucide-react";

const galleryImages = [
  { id: 1, src: "/images/saree_wedding.png", span: "md:col-span-1 md:row-span-2" },
  { id: 2, src: "/images/saree_organza.png", span: "md:col-span-1 md:row-span-1" },
  { id: 3, src: "/images/saree_office.png", span: "md:col-span-1 md:row-span-1" },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=800&q=80",
    span: "md:col-span-1 md:row-span-1",
  },
  { id: 4, src: "/images/saree_festive.png", span: "md:col-span-2 md:row-span-1" },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=800&q=80",
    span: "md:col-span-1 md:row-span-1",
  },
];

export function StyleGallery() {
  return (
    <section className="gsap-section py-24 md:py-32 bg-background border-t border-border">
      <div className="container-luxe">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-18">
          <p className="eyebrow mb-4">#DrapevaWomen</p>
          <h2 className="font-display text-3xl md:text-5xl">Styled By You</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            See how our customers bring Drapeva sarees to life with their unique style. From festive
            celebrations to everyday moments, every look tells a story. Share your Drapeva
            experience and inspire others.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[200px] md:auto-rows-[300px]">
          {galleryImages.map((img) => (
            <a
              key={img.id}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className={`group relative overflow-hidden bg-muted/10 block ${img.span}`}
            >
              <img
                src={img.src}
                alt="Customer style"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-background/90 text-foreground flex items-center justify-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Instagram className="w-5 h-5" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
