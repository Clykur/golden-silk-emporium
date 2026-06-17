import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";

export type Product = {
  id: string;
  name: string;
  collection: string;
  category: "Sarees" | "Lehengas" | "Suits" | "Bridal";
  fabric: "Silk" | "Banarasi" | "Georgette" | "Velvet";
  occasion: "Bridal" | "Festive" | "Reception" | "Everyday";
  price: number;
  compareAt?: number;
  image: string;
  images: string[];
  badge?: "New" | "Bestseller" | "Limited";
  description: string;
  details: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "noor-crimson",
    name: "Noor Crimson Bridal Lehenga",
    collection: "Vivah Couture",
    category: "Lehengas",
    fabric: "Velvet",
    occasion: "Bridal",
    price: 84500,
    compareAt: 98000,
    image: p1,
    images: [p1, p3, p4],
    badge: "Bestseller",
    description:
      "Hand-embroidered crimson velvet lehenga with zardozi florals and a tulle dupatta hand-finished with mukaish work.",
    details: [
      "Hand zardozi & sequin embroidery",
      "Pure silk velvet with cotton lining",
      "Includes blouse & embroidered dupatta",
      "Made-to-order in 4–6 weeks",
    ],
  },
  {
    id: "saira-blush",
    name: "Saira Blush Banarasi Saree",
    collection: "Heritage Weaves",
    category: "Sarees",
    fabric: "Banarasi",
    occasion: "Reception",
    price: 32400,
    image: p2,
    images: [p2, p4, p1],
    badge: "New",
    description:
      "Handwoven blush pink Banarasi silk with a 24k gold-tested zari border, designed in collaboration with master weavers from Varanasi.",
    details: [
      "Handloom pure Katan silk",
      "Real zari border & pallu",
      "Includes unstitched blouse piece",
      "Dry clean only",
    ],
  },
  {
    id: "ivaana-ivory",
    name: "Ivaana Ivory Anarkali",
    collection: "Soirée",
    category: "Suits",
    fabric: "Georgette",
    occasion: "Festive",
    price: 28900,
    image: p3,
    images: [p3, p1, p2],
    badge: "Limited",
    description:
      "An ethereal ivory Anarkali in flowing georgette, with delicate gold thread and pearl detailing along the bodice and hem.",
    details: [
      "Flowing georgette with silk lining",
      "Pearl & thread hand embroidery",
      "Includes churidar & dupatta",
      "True to size",
    ],
  },
  {
    id: "meera-emerald",
    name: "Meera Emerald Kanjivaram",
    collection: "Heritage Weaves",
    category: "Sarees",
    fabric: "Silk",
    occasion: "Bridal",
    price: 56800,
    compareAt: 62000,
    image: p4,
    images: [p4, p2, p1],
    badge: "Bestseller",
    description:
      "A regal emerald Kanjivaram woven in pure mulberry silk with a contrast gold border — heirloom craftsmanship from Tamil Nadu.",
    details: [
      "Pure mulberry silk",
      "Traditional Kanjivaram weave",
      "Real zari motifs",
      "Includes blouse piece",
    ],
  },
  {
    id: "noor-crimson-2",
    name: "Aria Rose Tulle Lehenga",
    collection: "Soirée",
    category: "Lehengas",
    fabric: "Georgette",
    occasion: "Reception",
    price: 46200,
    image: p1,
    images: [p1, p2, p3],
    badge: "New",
    description:
      "Dusty rose tulle lehenga layered with hand-cut sequin florals, paired with a fitted blouse and sheer dupatta.",
    details: [
      "Multi-layer tulle skirt",
      "Hand-cut sequin embellishment",
      "Includes blouse & dupatta",
      "Made-to-order",
    ],
  },
  {
    id: "saira-blush-2",
    name: "Roshni Champagne Saree",
    collection: "Soirée",
    category: "Sarees",
    fabric: "Georgette",
    occasion: "Festive",
    price: 24800,
    image: p2,
    images: [p2, p3, p4],
    description:
      "A champagne georgette saree with shimmering crystal-cut embellishments along the pallu — fluid, modern, unforgettable.",
    details: [
      "Pure georgette with satin border",
      "Crystal pallu detailing",
      "Includes blouse piece",
      "Dry clean only",
    ],
  },
  {
    id: "ivaana-ivory-2",
    name: "Zara Pearl Anarkali",
    collection: "Vivah Couture",
    category: "Suits",
    fabric: "Silk",
    occasion: "Bridal",
    price: 38400,
    image: p3,
    images: [p3, p4, p1],
    description:
      "Soft champagne silk Anarkali with hand-stitched pearl panels, channeling old-world bridal elegance.",
    details: [
      "Raw silk Anarkali",
      "Hand pearl embroidery",
      "Includes churidar & dupatta",
      "Made-to-order in 3–5 weeks",
    ],
  },
  {
    id: "meera-emerald-2",
    name: "Laila Forest Silk Saree",
    collection: "Heritage Weaves",
    category: "Sarees",
    fabric: "Silk",
    occasion: "Festive",
    price: 29900,
    image: p4,
    images: [p4, p1, p2],
    description:
      "Deep forest green silk saree with a finely woven gold temple border — an heirloom for the modern bride.",
    details: [
      "Pure mulberry silk",
      "Temple-border zari weave",
      "Includes blouse piece",
      "Dry clean only",
    ],
  },
];

export const COLLECTIONS = [
  {
    slug: "vivah-couture",
    name: "Vivah Couture",
    tagline: "The bridal trousseau",
    image: p1,
  },
  {
    slug: "heritage-weaves",
    name: "Heritage Weaves",
    tagline: "Handloom rarities",
    image: p4,
  },
  {
    slug: "soiree",
    name: "Soirée",
    tagline: "For the celebration",
    image: p3,
  },
];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
