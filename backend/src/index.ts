import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables
const requiredEnv = ["DATABASE_URL", "JWT_SECRET", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"];

const missingEnv = requiredEnv.filter((envVar) => !process.env[envVar]);
if (missingEnv.length > 0) {
  const timestamp = new Date().toISOString();
  console.warn(
    `[${timestamp}] WARNING: Missing recommended environment variables: ${missingEnv.join(", ")}`,
  );
  if (process.env.NODE_ENV === "production") {
    console.error(
      `[${timestamp}] CRITICAL: Server starting in production mode but missing required secrets. Application might fail.`,
    );
  }
}

import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  DRAPEVA BACKEND SERVER RUNNING         `);
  console.log(`  Port: ${PORT}                          `);
  console.log(`  Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`=========================================`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated.");
  });
});
