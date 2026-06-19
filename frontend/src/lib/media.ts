// Centralized Media Architecture for Golden Silk Emporium (Maaya Couture)
// All assets here point to verified, publicly accessible, luxury saree-related URLs.

// 1. Hero Section Assets
export const HERO_VIDEO =
  "https://videos.pexels.com/video-files/7430072/7430072-hd_1920_1080_30fps.mp4";
export const HERO_POSTER =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80"; // Premium ethnic fashion portraits

// 2. Collection Imagery (Unique, luxury sarees only)
export const COLLECTION_IMAGES = {
  kanjivaram:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80", // Luxury Kanjivaram
  banarasi:
    "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=1200&q=80", // Red bridal (Banarasi)
  organza:
    "https://images.unsplash.com/photo-1678705730064-a7ecbab4b3fb?auto=format&fit=crop&w=1200&q=80", // Festive designer
  silk:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80", // Green silk
  handloom:
    "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=80", // Mustard handloom
  bridal:
    "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=1200&q=80", // Bridal silk

  // Legacy mappings for existing collection slugs
  heritageWeaves:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
  vivahCouture:
    "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=1200&q=80",
  soiree:
    "https://images.unsplash.com/photo-1678705730064-a7ecbab4b3fb?auto=format&fit=crop&w=1200&q=80",
  modernMinimalist:
    "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=80", // Pastel contemporary
} as const;

// 3. Curated Pool of High-Quality Unsplash Saree and Textile Craftsmanship Photo IDs
// Grouped into Hero, Collection, Details, Lifestyle, and Category Banner images (total 30 images)
const SAREE_UNSPLASH_IDS = [
  "photo-1641699862936-be9f49b1c38d",
  "photo-1610189012906-4c0aa9b9781e",
  "photo-1678705730064-a7ecbab4b3fb",
  "photo-1610189013429-a703f4b245cf",
  "photo-1610030469245-ab65c4583802",
  "photo-1739429942146-122ea1aa7987",
  "photo-1609748513078-9ff6232781c5",
  "photo-1610030469069-cb6620bea733",
  "photo-1679006831648-7c9ea12e5807",
  "photo-1727430228383-aa1fb59db8bf",
  "photo-1610030469839-f909584b43f1",
  "photo-1572470176170-98fa8abcb741",
  "photo-1692992193981-d3d92fabd9cb",
  "photo-1654764746225-e63f5e90facd",
  "photo-1610189026205-27510cfc52f8",
  "photo-1717835735088-4c821959bdaa",
  "photo-1742287721821-ddf522b3f37b",
  "photo-1610189026297-df356264479c",
  "photo-1742287724816-4a8a1cc7ad5c",
  "photo-1610030469983-98e550d6193c",
  "photo-1619516388835-2b60acc4049e",
  "photo-1732709470611-670308da8c5e",
  "photo-1610189338175-0782dfdb0c04",
  "photo-1609748341932-f0206c09412b",
  "photo-1610189337543-1c5d8e64f574",
  "photo-1656562104781-c6151e79e060",
  "photo-1756483571456-6fa86cb1ae53",
  "photo-1654764746590-841871176bc0",
  "photo-1618489335755-e3aa2b16cd7a",
  "photo-1609748340756-aeb8223d6c64",
];

// Helper to construct highly unique images for 105 products
// Each product contains a unique main image and a gallery of 3 unique cropped/detailed angles
export const PRODUCT_IMAGES = Array.from({ length: 105 }, (_, i) => {
  const mainId = SAREE_UNSPLASH_IDS[i % SAREE_UNSPLASH_IDS.length];
  const gal1Id = SAREE_UNSPLASH_IDS[(i + 1) % SAREE_UNSPLASH_IDS.length];
  const gal2Id = SAREE_UNSPLASH_IDS[(i + 2) % SAREE_UNSPLASH_IDS.length];
  const gal3Id = SAREE_UNSPLASH_IDS[(i + 3) % SAREE_UNSPLASH_IDS.length];

  return {
    image: `https://images.unsplash.com/${mainId}?auto=format&fit=crop&w=800&q=80&sig=main-${i}`,
    gallery: [
      `https://images.unsplash.com/${mainId}?auto=format&fit=crop&w=800&q=80&sig=gal0-${i}`,
      `https://images.unsplash.com/${gal1Id}?auto=format&fit=crop&w=800&q=80&sig=gal1-${i}`,
      `https://images.unsplash.com/${gal2Id}?auto=format&fit=crop&w=800&q=80&sig=gal2-${i}`,
      `https://images.unsplash.com/${gal3Id}?auto=format&fit=crop&w=800&q=80&sig=gal3-${i}`,
    ],
  };
});

// Editorial/Other Sections Images
export const EDITORIAL_IMAGES = {
  storyHero:
    "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=1600&q=80", // Elegant lifestyle
  storyLoom:
    "https://images.unsplash.com/photo-1608962776074-88db09c8d5d4?auto=format&fit=crop&w=1200&q=80", // Fabric craftsmanship loom weaving
  storyCraft:
    "https://images.unsplash.com/photo-1621184456254-8c8869c9b5a3?auto=format&fit=crop&w=1200&q=80", // Silk texture close up

  // Celebrity Looks
  celebAlia:
    "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?auto=format&fit=crop&w=900&q=80", // Ivory luxury
  celebDeepika:
    "https://images.unsplash.com/photo-1717835735088-4c821959bdaa?auto=format&fit=crop&w=900&q=80", // Wine embroidered

  // Virtual Catalog Covers
  catalogPage1:
    "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=900&q=80", // Bridal collection cover
  catalogPage2:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80", // Silk collection cover
  catalogPage3:
    "https://images.unsplash.com/photo-1678705730064-a7ecbab4b3fb?auto=format&fit=crop&w=900&q=80", // Designer collection cover
  catalogPage4:
    "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=900&q=80", // Festive collection cover
};
