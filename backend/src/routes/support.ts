import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middlewares/auth.js";
import { EmailService } from "../services/email.js";

import { escapeHTML } from "../utils/sanitize.js";

const router = Router();

const TicketSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(4),
  message: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

// 1. Submit Support Ticket (Public/Auth)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = TicketSchema.parse(req.body);

    const ticket = await prisma.supportTicket.create({
      data: {
        name: escapeHTML(data.name),
        email: data.email,
        subject: escapeHTML(data.subject),
        message: escapeHTML(data.message),
        priority: data.priority || "MEDIUM",
        status: "OPEN",
      },
    });

    // Notify Support Admin
    await EmailService.sendEmail(
      "drapeva2026@gmail.com",
      `New Support Ticket: ${data.subject}`,
      `<p>Received support ticket from ${data.name} (${data.email}):</p><p>Message: ${data.message}</p>`,
    );

    res.status(201).json(ticket);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

// 2. Newsletter Subscription
router.post("/newsletter", async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email, isActive: true },
    });

    await EmailService.sendEmail(
      email,
      "Welcome to the Drapeva Journal - Newsletter",
      `<h3>Welcome to Drapeva</h3><p>Thank you for subscribing to our weekly journal. You will receive updates on new collections and artisan stories.</p>`,
    );

    res.json({ message: "Subscription successful", subscriber });
  } catch (err) {
    next(err);
  }
});

// 3. View All Tickets (Admin Only)
router.get(
  "/tickets",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tickets = await prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.json(tickets);
    } catch (err) {
      next(err);
    }
  },
);

// 4. Update Ticket Status (Admin Only)
router.put(
  "/tickets/:id",
  authenticateJWT,
  requireRole(["ADMIN"]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
      const StatusSchema = z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]);
      const parsedStatus = StatusSchema.parse(status);

      const ticket = await prisma.supportTicket.update({
        where: { id: id as string },
        data: { status: parsedStatus },
      });

      res.json(ticket);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status value" });
      }
      next(err);
    }
  },
);

export default router;
