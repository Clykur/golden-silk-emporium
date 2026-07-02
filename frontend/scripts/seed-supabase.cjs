const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// 1. Parse .env.local file
const envPath = path.resolve(__dirname, "../.env.local");
const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const k = trimmed.substring(0, idx).trim();
      let v = trimmed.substring(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.substring(1, v.length - 1);
      }
      env[k] = v;
    }
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in frontend/.env.local",
  );
  process.exit(1);
}

console.log("Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const NAMES_PREFIX = [
  "Varanasi Heritage",
  "Vaikuntha Gold",
  "Rajkumari",
  "Amrit",
  "Svarna",
  "Mayur",
  "Noor",
  "Ziba",
  "Zoya",
  "Gauri",
  "Yamuna",
  "Madhubani",
  "Chitra",
  "Radha",
  "Sitara",
  "Devi",
  "Avani",
  "Vasundhara",
  "Gayatri",
  "Shyama",
  "Meera",
  "Asha",
  "Dia",
  "Tara",
  "Utsav",
  "Manjula",
  "Kamala",
  "Kalyani",
  "Nutan",
  "Hema",
  "Rekha",
  "Jaya",
  "Priya",
  "Kriti",
  "Deepika",
  "Aditi",
  "Zara",
  "Aria",
  "Laila",
  "Kavya",
  "Ananya",
  "Veda",
  "Savitri",
  "Narmada",
  "Padma",
  "Uma",
  "Kashmiri",
  "Juhu Breeze",
  "Malabar",
  "Deccan",
  "Nirvana",
  "Chanderi Night",
  "Nilgiri",
  "Darjeeling",
  "Brahmaputra",
  "Saraswati",
  "Monalisa",
  "Aishwarya",
  "Rukmini",
  "Ahalya",
  "Draupadi",
  "Damayanti",
  "Shakuntala",
];

const NAMES_SUFFIX = [
  "Katan Silk Saree",
  "Zardozi Brocade Saree",
  "Tissue Organza Saree",
  "Handwoven Kanjivaram",
  "Ethereal Chiffon Saree",
  "Handblock Linen Saree",
  "Mulmul Cotton Saree",
  "Chanderi Silk Saree",
  "Paithani Peacock Saree",
  "Patola Double Ikat Saree",
  "Jamdani Floral Saree",
  "Chikankari Georgette Saree",
  "Bandhani Silk Saree",
  "Jacquard Organza Saree",
  "Raw Silk Heirloom Saree",
  "Muga Silk Saree",
  "Tussar Handloom Saree",
  "Kota Doria Cotton Saree",
];

const COLORS = [
  "Crimson Red",
  "Emerald Green",
  "Royal Blue",
  "Mustard Yellow",
  "Blush Pink",
  "Ivory White",
  "Champagne Gold",
  "Plum Violet",
  "Mint Green",
  "Turquoise Blue",
  "Peach Sorbet",
  "Teal Blue",
  "Burnt Orange",
  "Midnight Black",
  "Lavender Mist",
  "Ruby Wine",
  "Copper Metallic",
  "Saffron Orange",
  "Coral Pink",
  "Marigold Gold",
];

const FABRICS = [
  "Kanjivaram",
  "Banarasi",
  "Silk",
  "Organza",
  "Chiffon",
  "Linen",
  "Cotton",
  "Designer",
  "Handloom",
  "Contemporary",
];

const WEAVES = [
  "Kanjivaram",
  "Banarasi",
  "Jamdani",
  "Patola",
  "Chanderi",
  "Chikankari",
  "Ikat",
  "Paithani",
  "None",
];

const OCCASIONS = ["Bridal", "Festive", "Reception", "Casual", "Formal"];
const BADGES = ["New", "Bestseller", "Limited"];

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

const getDescription = (name, fabric, color, occasion) => {
  return `An exquisite ${color} ${fabric} saree, meticulously curated for ${occasion.toLowerCase()} occasions. Features handloom details, a custom border, and a matching unstitched blouse piece. Woven by our trusted partner weavers in South India.`;
};

async function seed() {
  try {
    console.log("Fetching categories & collections from Supabase...");
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, slug");
    if (catError) throw catError;

    const { data: collections, error: colError } = await supabase
      .from("collections")
      .select("id, slug");
    if (colError) throw colError;

    const categoriesMap = {};
    categories.forEach((c) => {
      categoriesMap[c.slug] = c.id;
    });

    const collectionsMap = {};
    collections.forEach((c) => {
      collectionsMap[c.slug] = c.id;
    });

    console.log(`Found ${categories.length} categories and ${collections.length} collections.`);

    console.log("Checking if products already exist...");
    const { data: existingProds, error: countError } = await supabase
      .from("products")
      .select("id", { count: "exact" });
    if (countError) throw countError;

    if (existingProds && existingProds.length > 0) {
      console.log(
        `Database already has ${existingProds.length} products. Cleaning up products before seed...`,
      );
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (deleteError) throw deleteError;
      console.log("Successfully cleared existing products.");
    }

    console.log("Generating 105 products...");
    const productsToInsert = [];
    const imagesToInsert = [];

    for (let i = 0; i < 105; i++) {
      const pfx = NAMES_PREFIX[i % NAMES_PREFIX.length];
      const sfx = NAMES_SUFFIX[(i + 3) % NAMES_SUFFIX.length];
      const name = `${pfx} ${sfx}`;
      const slug = `saree-${i + 1}-${pfx.toLowerCase().replace(/\s+/g, "-")}`;
      const sku = `SR-${1000 + i}`;

      const fabric = FABRICS[i % FABRICS.length];
      const weave = WEAVES[(i + 1) % WEAVES.length];
      const color = COLORS[(i + 2) % COLORS.length];
      const occasion = OCCASIONS[(i + 4) % OCCASIONS.length];

      // Determine collection slug
      let colSlug = "heritage-weaves";
      if (occasion === "Bridal") {
        colSlug = "vivah-couture";
      } else if (occasion === "Festive" || fabric === "Organza" || fabric === "Chiffon") {
        colSlug = "soiree";
      } else if (fabric === "Linen" || fabric === "Cotton" || occasion === "Casual") {
        colSlug = "modern-minimalist";
      }
      const collectionId = collectionsMap[colSlug];

      // Determine category dynamically
      let catSlug = "silk-sarees";
      if (weave === "Kanjivaram") {
        catSlug = "kanjivaram-sarees";
      } else if (weave === "Banarasi") {
        catSlug = "banarasi-sarees";
      } else if (fabric === "Organza") {
        catSlug = "organza-sarees";
      } else if (fabric === "Chiffon") {
        catSlug = "chiffon-sarees";
      } else if (fabric === "Linen") {
        catSlug = "linen-sarees";
      } else if (fabric === "Cotton") {
        catSlug = "cotton-sarees";
      } else if (occasion === "Bridal") {
        catSlug = "bridal-sarees";
      } else if (occasion === "Festive") {
        catSlug = "festive-sarees";
      } else if (fabric === "Designer") {
        catSlug = "designer-sarees";
      } else if (fabric === "Contemporary") {
        catSlug = "contemporary-sarees";
      } else if (fabric === "Handloom") {
        catSlug = "handloom-sarees";
      } else if (colSlug === "heritage-weaves") {
        catSlug = "heritage-sarees";
      } else if (i % 7 === 0) {
        catSlug = "limited-edition-sarees";
      }
      const categoryId = categoriesMap[catSlug];

      // Determine price
      let price = 22000 + ((i * 1100) % 65000);
      if (colSlug === "vivah-couture") {
        price = 68000 + ((i * 2500) % 115000);
      } else if (fabric === "Linen" || fabric === "Cotton") {
        price = 12500 + ((i * 700) % 18000);
      }

      const compareAt = i % 3 === 0 ? Math.floor(price * 1.15) : null;
      const badge = i % 7 === 0 ? BADGES[i % BADGES.length] : null;

      const details = [
        `Authentic ${fabric} fabric`,
        weave !== "None" ? `Traditional ${weave} weaving pattern` : "Handloom finished detailing",
        "Includes matching 80cm unstitched blouse piece",
        "Finished with hand-knotted tassels on the pallu",
        "Dry clean only to maintain silk luster",
        `Handcrafted over ${colSlug === "vivah-couture" ? "4–6 weeks" : "2–3 weeks"}`,
      ];

      const tags = [fabric, weave, color, occasion, colSlug].filter((t) => t && t !== "None");

      productsToInsert.push({
        name,
        slug,
        sku,
        description: getDescription(name, fabric, color, occasion),
        price,
        compare_at: compareAt,
        category_id: categoryId || null,
        collection_id: collectionId || null,
        fabric,
        color,
        occasion,
        tags,
        details,
        stock_quantity: Math.floor(Math.random() * 8) + 2,
        is_featured: i % 12 === 0,
        is_bestseller: i % 8 === 0,
        is_new_arrival: i % 6 === 0,
        status: "published",
        weave,
        badge: badge || "",
      });
    }

    console.log("Inserting products in chunks...");
    const chunkSize = 20;
    const insertedProducts = [];
    for (let i = 0; i < productsToInsert.length; i += chunkSize) {
      const chunk = productsToInsert.slice(i, i + chunkSize);
      const { data, error } = await supabase.from("products").insert(chunk).select();
      if (error) throw error;
      insertedProducts.push(...data);
      console.log(`Inserted products ${insertedProducts.length}/${productsToInsert.length}`);
    }

    console.log("Generating and inserting images...");
    for (let i = 0; i < insertedProducts.length; i++) {
      const product = insertedProducts[i];
      const mainId = SAREE_UNSPLASH_IDS[i % SAREE_UNSPLASH_IDS.length];
      const gal1Id = SAREE_UNSPLASH_IDS[(i + 1) % SAREE_UNSPLASH_IDS.length];
      const gal2Id = SAREE_UNSPLASH_IDS[(i + 2) % SAREE_UNSPLASH_IDS.length];
      const gal3Id = SAREE_UNSPLASH_IDS[(i + 3) % SAREE_UNSPLASH_IDS.length];

      const images = [
        `https://images.unsplash.com/${mainId}?auto=format&fit=crop&w=800&q=80&sig=main-${i}`,
        `https://images.unsplash.com/${mainId}?auto=format&fit=crop&w=800&q=80&sig=gal0-${i}`,
        `https://images.unsplash.com/${gal1Id}?auto=format&fit=crop&w=800&q=80&sig=gal1-${i}`,
        `https://images.unsplash.com/${gal2Id}?auto=format&fit=crop&w=800&q=80&sig=gal2-${i}`,
        `https://images.unsplash.com/${gal3Id}?auto=format&fit=crop&w=800&q=80&sig=gal3-${i}`,
      ];

      images.forEach((url, index) => {
        imagesToInsert.push({
          product_id: product.id,
          url,
          is_featured: index === 0,
          sort_order: index,
          alt_text: `${product.name} Image ${index + 1}`,
        });
      });
    }

    console.log(`Inserting ${imagesToInsert.length} images...`);
    for (let i = 0; i < imagesToInsert.length; i += chunkSize * 5) {
      const chunk = imagesToInsert.slice(i, i + chunkSize * 5);
      const { error } = await supabase.from("product_images").insert(chunk);
      if (error) throw error;
      console.log(
        `Inserted images ${Math.min(i + chunkSize * 5, imagesToInsert.length)}/${imagesToInsert.length}`,
      );
    }

    // Seed test coupons
    console.log("Checking if coupons exist...");
    const { data: existingCoupons } = await supabase.from("coupons").select("id");
    if (!existingCoupons || existingCoupons.length === 0) {
      console.log("Seeding coupons...");
      const coupons = [
        {
          code: "FESTIVE10",
          discount_type: "percentage",
          discount_value: 10,
          min_order_value: 25000,
          max_discount_value: 5000,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
          is_active: true,
        },
        {
          code: "WELCOME5000",
          discount_type: "fixed",
          discount_value: 5000,
          min_order_value: 50000,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
          is_active: true,
        },
      ];
      const { error: couponError } = await supabase.from("coupons").insert(coupons);
      if (couponError) throw couponError;
      console.log("Coupons seeded successfully.");
    }

    console.log("=============================================");
    console.log("   Supabase Seeding Completed Successfully!  ");
    console.log("=============================================");
  } catch (error) {
    console.error("Error seeding Supabase database:", error);
    process.exit(1);
  }
}

seed();
