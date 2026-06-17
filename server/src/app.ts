import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import appointmentRoutes from "./routes/appointment.js";
import blogRoutes from "./routes/blog.js";
import supportRoutes from "./routes/support.js";

const app = express();

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// REST Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/support", supportRoutes);

// Health check
app.get("/health", (req: any, res: any) => {
  res.json({ status: "healthy", timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

export default app;
