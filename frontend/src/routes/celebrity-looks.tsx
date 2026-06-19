import { createFileRoute, Link } from "@tanstack/react-router";
import { EDITORIAL_IMAGES } from "@/lib/media";

export const Route = createFileRoute("/celebrity-looks")({
  head: () => ({
    meta: [
      { title: "Celebrity Looks — Drapeva" },
      {
        name: "description",
        content: "Explore handwoven sarees worn and styled by celebrities and icons.",
      },
    ],
  }),
  component: CelebrityLooks,
});

const CELEBRITY_EDITS = [
  {
    name: "Alia Bhatt",
    event: "Met Gala Afterparty",
    quote:
      "Wearing Drapeva's ivory Banarasi silk saree felt like carrying a piece of home. The pearl thread details and gold borders are breathtaking.",
    image: EDITORIAL_IMAGES.celebAlia,
    productId: "saree-6-mayur", // References a generated Kanjivaram/Banarasi ID
  },
  {
    name: "Deepika Padukone",
    event: "Royal Heritage Reception",
    quote:
      "The Crimson Silk Saree is a masterclass in zardozi embroidery. Extremely regal yet fluid to wear.",
    image: EDITORIAL_IMAGES.celebDeepika,
    productId: "saree-1-varanasi", // References generated saree-1-varanasi ID
  },
];

function CelebrityLooks() {
  return (
    <div>
      <div className="border-b border-border bg-champagne/30">
        <div className="container-luxe py-14 md:py-20 text-center">
          <p className="eyebrow">Red Carpet Edits</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">Celebrity Looks</h1>
          <span className="gold-divider mt-4 block mx-auto" />
        </div>
      </div>

      <div className="container-luxe py-16 space-y-16">
        <div className="grid gap-8 md:grid-cols-2">
          {CELEBRITY_EDITS.map((celeb) => (
            <div
              key={celeb.name}
              className="border border-border p-6 bg-champagne/5 flex flex-col justify-between hover-lift"
            >
              <div className="space-y-4">
                <img
                  src={celeb.image}
                  alt={celeb.name}
                  className="w-full aspect-[4/3] object-cover border border-border"
                />
                <div className="pt-4">
                  <span className="eyebrow text-gold">{celeb.event}</span>
                  <h2 className="font-display text-2xl mt-1">{celeb.name}</h2>
                  <blockquote className="mt-3 text-sm italic text-muted-foreground leading-relaxed">
                    "{celeb.quote}"
                  </blockquote>
                </div>
              </div>
              <div className="pt-6 border-t border-border mt-6">
                <Link
                  to="/product/$id"
                  params={{ id: celeb.productId }}
                  className="inline-block bg-foreground text-background px-5 py-3 text-[10px] uppercase tracking-wider font-semibold hover:bg-gold hover:text-gold-foreground transition-colors"
                >
                  Shop the look
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
