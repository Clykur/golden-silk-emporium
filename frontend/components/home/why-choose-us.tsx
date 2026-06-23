"use client";

import { ShieldCheck, Sparkles, Gem, Truck, Clock, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Gem,
    title: "Handpicked Quality",
    description:
      "Each piece is carefully handpicked after assessing its softness, comfort, and overall quality, ensuring every drape feels as exceptional as it looks.",
  },
  {
    icon: Sparkles,
    title: "Authentic",
    description:
      "Every piece is personally handpicked with a keen eye for quality, elegance, and timeless appeal, bringing you collections chosen with care and intention.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description:
      "Your transactions are encrypted and protected. We guarantee the authenticity of every purchase.",
  },
  {
    icon: HeartHandshake,
    title: "Easy Exchanges",
    description:
      "Need a different fit or style? Our easy exchange process is designed to make your shopping experience smooth and convenient.",
  },
  {
    icon: Truck,
    title: "Global Delivery",
    description: "Fast, insured shipping nationwide with premium, secure packaging.",
  },
  {
    icon: Clock,
    title: "24/7 Concierge",
    description:
      "Dedicated support for your orders and queries, ensuring a smooth and seamless experience with Drapeva.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="gsap-section bg-background py-24 md:py-32 border-b border-border">
      <div className="container-luxe">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <p className="eyebrow mb-4">The Drapeva Standard</p>
          <h2 className="font-display text-3xl md:text-5xl">Why Women Choose Drapeva</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            At Drapeva, comfort is at the heart of every collection. We carefully curate elegant
            styles that combine ease, sophistication, and timeless beauty in every drape.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {features.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="group relative">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/30 text-foreground transition-transform duration-500 group-hover:scale-110">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold mb-3 tracking-wide">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

              {/* Decorative line that grows on hover */}
              <div className="absolute -bottom-6 left-0 h-[1px] w-0 bg-foreground/20 transition-all duration-700 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
