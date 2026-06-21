import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middlewares/auth.js";
import { PaymentService } from "../services/payment.js";
import { EmailService } from "../services/email.js";
import { WhatsAppService } from "../services/whatsapp.js";

const router = Router();

const OrderInputSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "RAZORPAY"]),
  email: z.string().email(),
  phone: z.string(),
  name: z.string().min(2),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
});

// 1. Verify Coupon
router.post("/coupon/apply", async (req: Request, res: Response, next: NextFunction) => {
  const { code, cartTotal } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  try {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ error: "Invalid coupon code" });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        error: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString("en-IN")} required`,
      });
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountValue) {
        discount = Math.min(discount, coupon.maxDiscountValue);
      }
    } else {
      discount = coupon.discountValue;
    }

    res.json({ coupon, discount });
  } catch (err) {
    next(err);
  }
});

// 2. Create Order & Setup Session
router.post(
  "/",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const reqAny = req as any;
      const data = OrderInputSchema.parse(reqAny.body);

      // Calculate pricing in transaction
      const orderDetails = await prisma.$transaction(async (tx: any) => {
        let subtotal = 0;
        const verifiedItems = [];

        for (const item of data.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });

          if (!variant) throw new Error("Product variant not found");
          if (variant.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${variant.product.name} (${variant.size})`);
          }

          const price = variant.product.price;
          subtotal += price * item.quantity;
          verifiedItems.push({
            variantId: variant.id,
            quantity: item.quantity,
            price,
          });

          // Decrement stock
          const updatedVariant = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
            include: { product: true },
          });

          // Notify admins if stock is 3 or less
          if (updatedVariant.stock <= 3) {
            const admins = await tx.user.findMany({ where: { role: "ADMIN" } });
            if (admins.length > 0) {
              const notifications = admins.map((admin: any) => ({
                userId: admin.id,
                type: "LOW_STOCK",
                title: "Low Stock Alert",
                message: `Product ${updatedVariant.product.name} (${updatedVariant.size}) has only ${updatedVariant.stock} units left in stock.`,
              }));
              await tx.notification.createMany({ data: notifications });
            }
          }
        }

        // Shipping & Tax
        const shippingCost = subtotal > 50000 ? 0 : 1500;
        const tax = subtotal * 0.12; // 12% GST

        // Coupon discount
        let discount = 0;
        let couponId: string | null = null;
        if (data.couponCode) {
          const coupon = await tx.coupon.findUnique({ where: { code: data.couponCode } });
          if (
            coupon &&
            coupon.isActive &&
            (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
            subtotal >= coupon.minOrderValue
          ) {
            couponId = coupon.id;
            if (coupon.discountType === "PERCENTAGE") {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maxDiscountValue) discount = Math.min(discount, coupon.maxDiscountValue);
            } else {
              discount = coupon.discountValue;
            }
          }
        }

        const total = subtotal + tax + shippingCost - discount;

        // Address saving
        const address = await tx.address.create({
          data: {
            userId: reqAny.user!.id,
            type: "SHIPPING",
            name: data.name,
            phone: data.phone,
            line1: data.address.line1,
            line2: data.address.line2,
            city: data.address.city,
            state: data.address.state,
            postalCode: data.address.postalCode,
            country: data.address.country,
          },
        });

        const order = await tx.order.create({
          data: {
            userId: reqAny.user!.id,
            status: "PENDING",
            subtotal,
            tax,
            shippingCost,
            discount,
            total,
            addressId: address.id,
            couponId,
            email: data.email,
            phone: data.phone,
            name: data.name,
            items: {
              create: verifiedItems,
            },
          },
        });

        // Clear current user cart
        const cart = await tx.cart.findUnique({ where: { userId: reqAny.user!.id } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        }

        return { order, total };
      });

      // Generate Payment links
      let checkoutDetails = {};
      if (data.paymentMethod === "STRIPE") {
        const successUrl = `http://localhost:3000/checkout/success?order_id=${orderDetails.order.id}`;
        const cancelUrl = `http://localhost:3000/checkout/cancel?order_id=${orderDetails.order.id}`;
        const session = await PaymentService.createStripeSession(
          orderDetails.order.id,
          orderDetails.total,
          "inr",
          successUrl,
          cancelUrl,
        );
        checkoutDetails = { paymentMethod: "STRIPE", sessionId: session.id, url: session.url };
      } else {
        const order = await PaymentService.createRazorpayOrder(
          orderDetails.order.id,
          orderDetails.total,
        );
        checkoutDetails = { paymentMethod: "RAZORPAY", orderId: order.id, amount: order.amount };
      }

      res.status(201).json({
        order: orderDetails.order,
        ...checkoutDetails,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      res.status(400).json({ error: err.message });
    }
  },
);

// 3. Verify Payment
router.post(
  "/verify-payment",
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, razorpayPaymentId, razorpayOrderId, signature, stripeSessionId } = req.body;

    try {
      let success = false;
      let transactionId = "";
      let method = "";

      if (stripeSessionId) {
        // Simple verification mock or fetch stripe details
        success = true;
        transactionId = stripeSessionId;
        method = "STRIPE";
      } else if (signature) {
        success = PaymentService.verifyRazorpaySignature(
          razorpayOrderId,
          razorpayPaymentId,
          signature,
        );
        transactionId = razorpayPaymentId;
        method = "RAZORPAY";
      }

      if (success) {
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        });

        // Create Payment log
        await prisma.payment.create({
          data: {
            orderId,
            method,
            status: "COMPLETED",
            transactionId,
            amount: order.total,
          },
        });

        // Send order emails & messages
        await EmailService.sendOrderConfirmation(order.email, order.name, order.id, order.total);
        await WhatsAppService.sendOrderUpdate(order.phone, order.id, "PROCESSING");

        res.json({ success: true, message: "Payment verified successfully" });
      } else {
        res.status(400).json({ error: "Payment verification failed" });
      }
    } catch (err) {
      next(err);
    }
  },
);

// 4. Retrieve Order History (Admin or User's own)
router.get(
  "/",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const orders = await prisma.order.findMany({
        where: req.user!.role === "ADMIN" ? {} : { userId: req.user!.id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
          address: true,
        },
        orderBy: { createdAt: "desc" },
      });
      res.json(orders);
    } catch (err) {
      next(err);
    }
  },
);

// 5. Get Order Details & Tracking
router.get(
  "/:id",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const reqAny = req as any;
    const { id } = reqAny.params;

    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              variant: { include: { product: true } },
            },
          },
          address: true,
          payments: true,
        },
      });

      if (!order) return res.status(404).json({ error: "Order not found" });

      // Validate ownership
      if (reqAny.user!.role !== "ADMIN" && order.userId !== reqAny.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(order);
    } catch (err) {
      next(err);
    }
  },
);

// 6. Update Status (Admin Only)
router.put(
  "/:id/status",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const order = await prisma.order.update({
        where: { id: id as string },
        data: { status },
      });

      // Notify Customer
      await WhatsAppService.sendOrderUpdate(order.phone, order.id, status);
      await EmailService.sendEmail(
        order.email,
        `Your Drapeva Order Update - #${order.id}`,
        `<p>Dear ${order.name},</p><p>The status of your couture piece #${order.id} has been updated to: <strong>${status}</strong>.</p>`,
      );

      res.json(order);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
