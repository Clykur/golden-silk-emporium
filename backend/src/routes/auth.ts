import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { EmailService } from "../services/email.js";
import { authenticateJWT, AuthenticatedRequest } from "../middlewares/auth.js";
import { getSupabaseClient } from "../services/supabase.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "Critical security keys JWT_SECRET or JWT_REFRESH_SECRET are missing from the environment",
  );
}

// Validation Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().min(10),
});

const LoginSchema = z.object({
  identifier: z.string(),
  password: z.string(),
});

// Helper to generate tokens
function generateTokens(user: { id: string; email: string; role: "CUSTOMER" | "ADMIN" }) {
  const accessToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET!, {
    expiresIn: "15m",
    audience: "drapeva-app",
    issuer: "drapeva-api",
  });
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_REFRESH_SECRET!,
    {
      expiresIn: "7d",
      audience: "drapeva-app",
      issuer: "drapeva-api",
    },
  );
  return { accessToken, refreshToken };
}

// 1. Register Customer
router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = RegisterSchema.parse(req.body);

    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const formattedPhone = data.phone.startsWith("+")
      ? data.phone
      : `+91${data.phone.replace(/\D/g, "")}`;
    const existingPhone = await prisma.user.findFirst({ where: { phone: formattedPhone } });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone number already registered" });
    }

    const sbClient = await getSupabaseClient();
    let authData: any = { user: null };
    let signUpError: any = null;

    if (sbClient) {
      const result = await sbClient.auth.admin.createUser({
        email: data.email,
        phone: formattedPhone,
        password: data.password,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          name: data.name,
          phone: formattedPhone,
        },
      });
      authData = result.data;
      signUpError = result.error;
    }

    if (signUpError) {
      return res.status(400).json({ error: signUpError?.message || "Sign up failed in Supabase" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        id: authData.user.id,
        email: data.email,
        passwordHash,
        name: data.name,
        phone: formattedPhone,
        role: "CUSTOMER",
      },
    });

    // Send Welcome Email
    await EmailService.sendWelcomeEmail(user.email, user.name);

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_REGISTER",
        details: `Registered email: ${user.email}`,
      },
    });

    const tokens = generateTokens(user);
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

// 2. Login User
router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = LoginSchema.parse(req.body);

    const isEmail = data.identifier.includes("@");
    const credentials: any = { password: data.password };
    const formatted = data.identifier.startsWith("+")
      ? data.identifier
      : `+91${data.identifier.replace(/\D/g, "")}`;

    if (isEmail) {
      credentials.email = data.identifier;
    } else {
      credentials.phone = formatted;
    }

    const sbClient = await getSupabaseClient();
    let authUser: any = null;
    let signInError: any = null;

    if (sbClient) {
      const result = await sbClient.auth.signInWithPassword(credentials);
      authUser = result.data?.user;
      signInError = result.error;
    }

    if (signInError) {
      return res.status(400).json({ error: signInError?.message || "Invalid credentials" });
    }

    let user;
    if (isEmail) {
      user = await prisma.user.findUnique({ where: { email: data.identifier } });
    } else {
      user = await prisma.user.findFirst({ where: { phone: formatted } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: authUser?.id || crypto.randomUUID(),
          email: authUser?.email || `user_${Date.now()}@drapeva.com`,
          passwordHash: await bcrypt.hash(data.password, 10),
          name: authUser?.user_metadata?.name || "Patron",
          phone: authUser?.user_metadata?.phone || formatted,
          role: "CUSTOMER",
        },
      });
    }

    // Write Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        details: `Logged in user: ${user.email}`,
      },
    });

    const tokens = generateTokens(user);
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    next(err);
  }
});

// 3. Refresh Access Token
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is required" });
  }

  jwt.verify(
    refreshToken,
    JWT_REFRESH_SECRET!,
    { audience: "drapeva-app", issuer: "drapeva-api" },
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid refresh token" });
      }

      const user = decoded as { id: string; email: string; role: "CUSTOMER" | "ADMIN" };
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET!,
        {
          expiresIn: "15m",
          audience: "drapeva-app",
          issuer: "drapeva-api",
        },
      );

      res.json({ accessToken });
    },
  );
});

// 4. Request Forgot Password
router.post("/forgot-password", async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      // Invalidate existing resets by using the password hash in the JWT secret
      const secret = JWT_SECRET! + user.passwordHash;
      const resetToken = jwt.sign({ id: user.id }, secret, {
        expiresIn: "1h",
        audience: "drapeva-app",
        issuer: "drapeva-api",
      });
      const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      await EmailService.sendEmail(
        email,
        "Reset Your Password - Drapeva",
        `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`,
      );
    }
    // Return 200 regardless for security reasons (don't leak user existence)
    res.json({ message: "Password reset instructions sent if email exists" });
  } catch (err) {
    next(err);
  }
});

// 5. Reset Password
router.post("/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  const { token, password, email } = req.body;
  if (!token || !password || !email)
    return res.status(400).json({ error: "Token, email, and password are required" });

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const secret = JWT_SECRET! + user.passwordHash;
    const decoded = jwt.verify(token, secret, {
      audience: "drapeva-app",
      issuer: "drapeva-api",
    }) as { id: string };

    if (decoded.id !== user.id) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

// 6. Verify Email
router.post("/verify-email", async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token is required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      audience: "drapeva-app",
      issuer: "drapeva-api",
    }) as { id: string };

    await prisma.auditLog.create({
      data: {
        userId: decoded.id,
        action: "EMAIL_VERIFY",
        details: `Verified email successfully`,
      },
    });
    res.json({ message: "Email verification successful" });
  } catch (err) {
    res.status(400).json({ error: "Invalid or expired verification token" });
  }
});

// 8. Fetch current user profile details
router.get(
  "/me",
  authenticateJWT,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
