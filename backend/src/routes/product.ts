import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { CacheService } from "../services/redis.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middlewares/auth.js";

const router = Router();

// Validation Schema for product CRUD
const ProductInputSchema = z.object({
  name: z.string().min(2),
  description: z.string(),
  price: z.number().positive(),
  compareAt: z.number().positive().optional().nullable(),
  fabric: z.string(),
  occasion: z.string(),
  badge: z.string().optional().nullable(),
  details: z.array(z.string()),
  categoryId: z.string(),
  collectionId: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altText: z.string().optional(),
        isFeatured: z.boolean().optional(),
      }),
    )
    .min(1),
  variants: z
    .array(
      z.object({
        size: z.string(),
        stock: z.number().int().nonnegative(),
      }),
    )
    .min(1),
});

// 1. Get Categories
router.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = "maaya:categories";
    const cached = await CacheService.get<any[]>(cacheKey);
    if (cached) return res.json(cached);

    const categories = await prisma.category.findMany();
    await CacheService.set(cacheKey, categories, 3600); // cache for 1 hr
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// 2. Get Collections
router.get("/collections", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = "maaya:collections";
    const cached = await CacheService.get<any[]>(cacheKey);
    if (cached) return res.json(cached);

    const collections = await prisma.collection.findMany();
    await CacheService.set(cacheKey, collections, 3600);
    res.json(collections);
  } catch (err) {
    next(err);
  }
});

// 3. Get Products (Filtered + Paginated + Searched)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, collection, fabric, occasion, query, sort, minPrice, maxPrice } = req.query;

    const where: any = {};

    if (category && category !== "all") {
      where.category = { slug: category as string };
    }
    if (collection) {
      where.collection = { slug: collection as string };
    }
    if (fabric) {
      where.fabric = fabric as string;
    }
    if (occasion) {
      where.occasion = occasion as string;
    }
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: "insensitive" } },
        { description: { contains: query as string, mode: "insensitive" } },
        { fabric: { contains: query as string, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice as string);
      if (maxPrice) where.price.lte = parseFloat(maxPrice as string);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };

    const products = await prisma.product.findMany({
      where,
      include: {
        images: true,
        variants: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      orderBy,
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
});

// 4. Get Single Product by slug/id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const cacheKey = `maaya:product:${id}`;

  try {
    const cached = await CacheService.get<any>(cacheKey);
    if (cached) return res.json(cached);

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: id as string }, { slug: id as string }] },
      include: {
        images: true,
        variants: true,
        category: true,
        collection: true,
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await CacheService.set(cacheKey, product, 1800); // 30 mins
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// 5. Create Product (Admin Only)
router.post(
  "/",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = ProductInputSchema.parse(req.body);
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const product = await prisma.$transaction(async (tx: any) => {
        const p = await tx.product.create({
          data: {
            name: data.name,
            slug,
            description: data.description,
            price: data.price,
            compareAt: data.compareAt,
            fabric: data.fabric,
            occasion: data.occasion,
            badge: data.badge,
            details: data.details,
            categoryId: data.categoryId,
            collectionId: data.collectionId,
          },
        });

        // Create images
        await tx.productImage.createMany({
          data: data.images.map((img) => ({
            productId: p.id,
            url: img.url,
            altText: img.altText || p.name,
            isFeatured: img.isFeatured || false,
          })),
        });

        // Create variants
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: p.id,
            size: v.size,
            sku: `${p.id.toUpperCase()}-${v.size}`,
            stock: v.stock,
          })),
        });

        return p;
      });

      // Invalidate product caches
      await CacheService.clearPattern("maaya:product:*");

      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      next(err);
    }
  },
);

// 6. Update Product (Admin Only)
router.put(
  "/:id",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      const data = ProductInputSchema.parse(req.body);
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      const product = await prisma.$transaction(async (tx: any) => {
        const p = await tx.product.update({
          where: { id },
          data: {
            name: data.name,
            slug,
            description: data.description,
            price: data.price,
            compareAt: data.compareAt,
            fabric: data.fabric,
            occasion: data.occasion,
            badge: data.badge,
            details: data.details,
            categoryId: data.categoryId,
            collectionId: data.collectionId,
          },
        });

        // Delete old images & variants
        await tx.productImage.deleteMany({ where: { productId: id } });
        await tx.productVariant.deleteMany({ where: { productId: id } });

        // Create new images
        await tx.productImage.createMany({
          data: data.images.map((img) => ({
            productId: p.id,
            url: img.url,
            altText: img.altText || p.name,
            isFeatured: img.isFeatured || false,
          })),
        });

        // Create new variants
        await tx.productVariant.createMany({
          data: data.variants.map((v) => ({
            productId: p.id,
            size: v.size,
            sku: `${p.id.toUpperCase()}-${v.size}`,
            stock: v.stock,
          })),
        });

        return p;
      });

      // Invalidate product caches
      await CacheService.del(`maaya:product:${id}`);
      await CacheService.clearPattern("maaya:product:*");

      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      next(err);
    }
  },
);

// 7. Delete Product (Admin Only)
router.delete(
  "/:id",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    try {
      await prisma.product.delete({ where: { id: id as string } });

      // Invalidate caches
      await CacheService.del(`maaya:product:${id}`);
      await CacheService.clearPattern("maaya:product:*");

      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      next(err);
    }
  },
);

// 8. Submit Review (Customer Only)
router.post(
  "/:id/reviews",
  authenticateJWT,
  requireRole(["CUSTOMER"]),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const reqAny = req as any;
    const { id } = reqAny.params;
    const { rating, title, comment } = reqAny.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
      const review = await prisma.review.create({
        data: {
          userId: reqAny.user!.id,
          productId: id,
          rating,
          title,
          comment,
          isApproved: false, // Moderation required
        },
      });

      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  },
);

// 9. Get Approved Reviews for Product
router.get("/:id/reviews", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { productId: id as string, isApproved: true },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

export default router;
