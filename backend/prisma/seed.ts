import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean the database
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Users
  const passwordHash = await bcrypt.hash("MaayaCouture2026!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@maayacouture.com",
      name: "Sanjana Roy",
      phone: "+919876543210",
      passwordHash,
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "customer@maayacouture.com",
      name: "Aishwarya Sen",
      phone: "+919876543211",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Default address for customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      type: "SHIPPING",
      name: "Aishwarya Sen",
      phone: "+919876543211",
      line1: "Flat 402, Signature Towers",
      line2: "Juhu Tara Road, Juhu",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400049",
      country: "India",
      isDefault: true,
    },
  });

  // 2. Categories
  const categoriesData = [
    { name: "Kanjivaram Sarees", slug: "kanjivaram-sarees" },
    { name: "Banarasi Sarees", slug: "banarasi-sarees" },
    { name: "Silk Sarees", slug: "silk-sarees" },
    { name: "Handloom Sarees", slug: "handloom-sarees" },
    { name: "Organza Sarees", slug: "organza-sarees" },
    { name: "Chiffon Sarees", slug: "chiffon-sarees" },
    { name: "Linen Sarees", slug: "linen-sarees" },
    { name: "Cotton Sarees", slug: "cotton-sarees" },
    { name: "Bridal Sarees", slug: "bridal-sarees" },
    { name: "Designer Sarees", slug: "designer-sarees" },
    { name: "Festive Sarees", slug: "festive-sarees" },
    { name: "Contemporary Sarees", slug: "contemporary-sarees" },
    { name: "Heritage Sarees", slug: "heritage-sarees" },
    { name: "Limited Edition Sarees", slug: "limited-edition-sarees" },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: cat,
    });
    categoriesMap[cat.slug] = createdCat.id;
  }

  // 3. Collections
  const vivah = await prisma.collection.create({
    data: {
      name: "Vivah Couture",
      slug: "vivah-couture",
      tagline: "The bridal trousseau",
      description: "Intricately detailed garments crafted for the luxury Indian bride.",
      image:
        "https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const heritage = await prisma.collection.create({
    data: {
      name: "Heritage Weaves",
      slug: "heritage-weaves",
      tagline: "Handloom rarities",
      description: "Masterpieces directly from the looms of Varanasi, Kanchipuram, and Patan.",
      image:
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const soiree = await prisma.collection.create({
    data: {
      name: "Soirée",
      slug: "soiree",
      tagline: "For the celebration",
      description: "Fluid shapes, pastel shades, and modern details for festive nights.",
      image:
        "https://images.unsplash.com/photo-1678705730064-a7ecbab4b3fb?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const modernMinimalist = await prisma.collection.create({
    data: {
      name: "Modern Minimalist",
      slug: "modern-minimalist",
      tagline: "Contemporary hand-block linens and everyday cottons",
      description: "Contemporary hand-block linens and breathable mulmul cottons designed for everyday elegance.",
      image:
        "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const collectionsMap = {
    "heritage-weaves": heritage.id,
    "vivah-couture": vivah.id,
    "soiree": soiree.id,
    "modern-minimalist": modernMinimalist.id,
  };

  // 4. Programmatic Saree Generator (Mirroring the 105 frontend sarees)
  const NAMES_PREFIX = [
    "Varanasi Heritage", "Vaikuntha Gold", "Rajkumari", "Amrit", "Svarna", "Mayur", "Noor", "Ziba",
    "Zoya", "Gauri", "Yamuna", "Madhubani", "Chitra", "Radha", "Sitara", "Devi", "Avani", "Vasundhara",
    "Gayatri", "Shyama", "Meera", "Asha", "Dia", "Tara", "Utsav", "Manjula", "Kamala", "Kalyani",
    "Nutan", "Hema", "Rekha", "Jaya", "Priya", "Kriti", "Deepika", "Aditi", "Zara", "Aria", "Laila",
    "Kavya", "Ananya", "Veda", "Savitri", "Narmada", "Padma", "Uma", "Kashmiri", "Juhu Breeze",
    "Malabar", "Deccan", "Nirvana", "Chanderi Night", "Nilgiri", "Darjeeling", "Brahmaputra",
    "Saraswati", "Monalisa", "Aishwarya", "Rukmini", "Ahalya", "Draupadi", "Damayanti", "Shakuntala",
  ];

  const NAMES_SUFFIX = [
    "Katan Silk Saree", "Zardozi Brocade Saree", "Tissue Organza Saree", "Handwoven Kanjivaram",
    "Ethereal Chiffon Saree", "Handblock Linen Saree", "Mulmul Cotton Saree", "Chanderi Silk Saree",
    "Paithani Peacock Saree", "Patola Double Ikat Saree", "Jamdani Floral Saree", "Chikankari Georgette Saree",
    "Bandhani Silk Saree", "Jacquard Organza Saree", "Raw Silk Heirloom Saree", "Muga Silk Saree",
    "Tussar Handloom Saree", "Kota Doria Cotton Saree",
  ];

  const COLORS = [
    "Crimson Red", "Emerald Green", "Royal Blue", "Mustard Yellow", "Blush Pink", "Ivory White",
    "Champagne Gold", "Plum Violet", "Mint Green", "Turquoise Blue", "Peach Sorbet", "Teal Blue",
    "Burnt Orange", "Midnight Black", "Lavender Mist", "Ruby Wine", "Copper Metallic", "Saffron Orange",
    "Coral Pink", "Marigold Gold",
  ];

  const FABRICS = [
    "Kanjivaram", "Banarasi", "Silk", "Organza", "Chiffon", "Linen", "Cotton", "Designer", "Handloom", "Contemporary",
  ];

  const WEAVES = [
    "Kanjivaram", "Banarasi", "Jamdani", "Patola", "Chanderi", "Chikankari", "Ikat", "Paithani", "None",
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

  const getDescription = (name: string, fabric: string, color: string, occasion: string): string => {
    return `An exquisite ${color} ${fabric} saree, meticulously curated for ${occasion.toLowerCase()} occasions. Features handloom details, a custom border, and a matching unstitched blouse piece. Woven in our partner atelier in South India.`;
  };

  const sizes = ["XS", "S", "M", "L", "XL"];

  for (let i = 0; i < 105; i++) {
    const pfx = NAMES_PREFIX[i % NAMES_PREFIX.length];
    const sfx = NAMES_SUFFIX[(i + 3) % NAMES_SUFFIX.length];
    const name = `${pfx} ${sfx}`;
    const id = `saree-${i + 1}-${pfx.toLowerCase().replace(/\s+/g, "-")}`;

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
    const collectionId = collectionsMap[colSlug as keyof typeof collectionsMap];

    // Determine category dynamically matching the 14 saree-focused categories
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

    // Determine price dynamically based on premium level (Kanjivaram, Banarasi are expensive)
    let price = 22000 + ((i * 1100) % 65000);
    if (colSlug === "vivah-couture") {
      price = 68000 + ((i * 2500) % 115000); // Bridal ranges from 68k to 183k
    } else if (fabric === "Linen" || fabric === "Cotton") {
      price = 12500 + ((i * 700) % 18000); // Linens range from 12.5k to 30k
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

    const product = await prisma.product.create({
      data: {
        id,
        name,
        slug: id,
        description: getDescription(name, fabric, color, occasion),
        price,
        compareAt,
        fabric,
        occasion,
        badge,
        details,
        categoryId,
        collectionId,
      },
    });

    // Create product images
    for (let j = 0; j < images.length; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[j],
          isFeatured: j === 0,
          altText: `${product.name} Image ${j + 1}`,
        },
      });
    }

    // Create variants with inventory
    for (const size of sizes) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size,
          sku: `${product.id.toUpperCase()}-${size}`,
          stock: Math.floor(Math.random() * 10) + 5,
        },
      });
    }
  }

  // 5. Coupons
  await prisma.coupon.create({
    data: {
      code: "FESTIVE10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 25000,
      maxDiscountValue: 5000,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "WELCOME5000",
      discountType: "FIXED",
      discountValue: 5000,
      minOrderValue: 50000,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
      isActive: true,
    },
  });

  // 6. Blog Posts
  await prisma.blogPost.create({
    data: {
      title: "The Art of Banarasi Weaving: A Heritage Unfolded",
      slug: "art-of-banarasi-weaving",
      content:
        "Deep in the lanes of Varanasi, master weavers throw the shuttle back and forth on manual wooden handlooms. Each warp and weft is a calculation in patience. A typical Banarasi saree takes three to five master artisans up to four weeks to weave. At Maaya, we preserve this delicate craft by ensuring fair wages and direct-to-artisan revenues.",
      image:
        "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=900&q=80",
      category: "Craftsmanship",
      author: "Atelier Curator",
      isPublished: true,
    },
  });

  await prisma.blogPost.create({
    data: {
      title: "What to Look for in Your Bridal Saree Trousseau",
      slug: "bridal-saree-trousseau-guide",
      content:
        "Your wedding day outfit is not just a garment; it is a piece of art that carries stories. When choosing your bridal saree, pay attention to the weight of the hand-done zardozi, the quality of the raw mulberry silk, and the comfort of the pallu drape. In this guide, our bridal concierge breaks down styling and fit guidelines.",
      image:
        "https://images.unsplash.com/photo-1717835735088-4c821959bdaa?auto=format&fit=crop&w=900&q=80",
      category: "Styling Guide",
      author: "Anamika Roy",
      isPublished: true,
    },
  });

  // 7. Support Tickets
  await prisma.supportTicket.create({
    data: {
      userId: customer.id,
      name: "Aishwarya Sen",
      email: "customer@maayacouture.com",
      subject: "Custom Blouse Sizing Request",
      message:
        "Hello, I recently ordered the Noor Crimson Bridal Kanjivaram Saree and would love to customize the sleeve length. How can I submit my exact measurements?",
      status: "OPEN",
      priority: "HIGH",
    },
  });

  // 8. Reviews
  await prisma.review.create({
    data: {
      userId: customer.id,
      productId: "noor-crimson",
      rating: 5,
      title: "An Heirloom Piece",
      comment:
        "The hand zardozi work is absolutely outstanding. Fits like a glove. Worth every single penny and more.",
      isApproved: true,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
