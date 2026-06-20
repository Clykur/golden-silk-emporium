# Deployment Guide — Golden Silk Emporium (Drapeva)

This guide documents the environment variable configuration, database setups, and step-by-step procedures for deploying both the Next.js frontend to Vercel and the Node.js/Express backend to Render.

---

## 1. Project Overview

Golden Silk Emporium (Drapeva) is organized as an **npm workspaces monorepo** to keep the client and server code co-located while allowing independent building and deployment.

* **Frontend**: Next.js App Router project located in the [frontend/](file:///Users/karthiknaramala/Desktop/golden-silk-emporium/frontend) directory.
* **Backend**: Node.js + Express + Prisma API server located in the [backend/](file:///Users/karthiknaramala/Desktop/golden-silk-emporium/backend) directory.

---

## 2. Vercel Environment Variables (Frontend)

Add these variables in your Vercel Project Settings (`Settings` -> `Environment Variables`).

| Variable Name | Purpose | Example / Production Value |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API Endpoint URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key for browser queries | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key for Admin operations | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID for client checkout | `rzp_live_1234567890` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | `abcdefghijklmnopqrstuvwx` |
| `RAZORPAY_WEBHOOK_SECRET` | Signature verification key for Razorpay Webhooks | `your-razorpay-webhook-secret` |
| `RESEND_API_KEY` | Resend API Key for sending order/welcome emails | `re_123456789abcdef` |
| `WHATSAPP_API_TOKEN` | WhatsApp Cloud API System User Access Token | `EAAG...` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone Number ID | `123456789012345` |
| `NEXT_PUBLIC_API_URL` | Target endpoint of the Express Payment REST API | `https://your-api.onrender.com` |
| `NEXT_PUBLIC_APP_URL` | Application root URL (for email redirect links) | `https://drapeva.com` |
| `ORDER_WEBHOOK_SECRET` | Header secret verifying Supabase order state webhooks | `your-order-webhook-secret` |

---

## 3. Render Environment Variables (Backend)

Add these variables in your Render Web Service Settings (`Environment` tab).

| Variable Name | Purpose | Example / Production Value |
|---|---|---|
| `DATABASE_URL` | Connection URL for your hosted PostgreSQL Database | `postgresql://postgres:password@host:port/dbname?sslmode=require` |
| `DIRECT_URL` | Direct connection URL (optional, bypasses connection poolers) | `postgresql://postgres:password@host:port/dbname` |
| `PORT` | Listening port for the Express application | `5000` |
| `NODE_ENV` | Running node environment | `production` |
| `SUPABASE_URL` | Supabase API endpoint (can also use `NEXT_PUBLIC_SUPABASE_URL`) | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key for Admin queries | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...` |
| `JWT_SECRET` | Secret key used to sign Express API auth tokens | `your-auth-jwt-secret` |
| `JWT_REFRESH_SECRET` | Secret key used to sign Express API refresh tokens | `your-refresh-jwt-secret` |
| `REDIS_URL` | Connection string for Redis cache (or `"mock"` to disable cache) | `redis://default:password@host:port` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID for backend transaction validation | `rzp_live_1234567890` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret for backend verification signature | `abcdefghijklmnopqrstuvwx` |
| `RESEND_API_KEY` | Resend API key for backend notification emails | `re_123456789abcdef` |
| `WHATSAPP_API_TOKEN` | WhatsApp Cloud API Token for order notification texts | `EAAG...` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone ID for notification texts | `123456789012345` |
| `FRONTEND_URL` | Allowed CORS origin (points to your Vercel deployment domain) | `https://drapeva.com` |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key (optional / mocked fallback) | `sk_live_...` |

---

## 4. Production Database Configurations

> [!IMPORTANT]
> **Applying Supabase SQL Schema**:
> You must run the SQL schema scripts in your Supabase Dashboard SQL Editor before testing registration or order creation:
> 1. Execute [supabase-schema.sql](file:///Users/karthiknaramala/Desktop/golden-silk-emporium/supabase-schema.sql) to set up tables, enums, triggers, RLS, and initial seed categories.
> 2. Execute [supabase-additions.sql](file:///Users/karthiknaramala/Desktop/golden-silk-emporium/supabase-additions.sql) to add addresses, notifications, returning capabilities, and webhook integrations.

### Supabase Auth Settings Configuration

* **Email Provider**: Navigate to `Auth` -> `Providers` -> `Email`.
  * **Confirm Email**: If enabled, users must click the verification link in their email inbox before registering. If disabled, new users are auto-confirmed and logged in immediately.
* **Phone Provider**: Navigate to `Auth` -> `Providers` -> `Phone`.
  * Ensure **SMS Provider** is configured (e.g. Twilio, Messagebird) if sending OTPs.
  * **Confirm Phone**: Disable this if you want new users who register with a phone number and password to be logged in immediately without SMS OTP verification.

---

## 5. Deployment Instructions

### Frontend (Vercel)

1. Connect your Github Repository to Vercel.
2. Select **`frontend`** as the **Root Directory**.
3. Framework Preset: **`Next.js`**.
4. Configure all environment variables in Section 2.
5. Click **Deploy**. Vercel will automatically run `npm run build` and provision serverless edge functions.

> [!NOTE]
> The legacy `vercel.json` SPA rewrite configurations have been cleared to ensure the Next.js App Router handles all routing dynamically. Do not restore the `/index.html` rewrite rules.

### Backend (Render)

1. Create a new **Web Service** on Render.
2. Connect your Github Repository.
3. Select **`backend`** as the **Root Directory**.
4. Runtime: **`Node`**.
5. Build Command:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
6. Start Command:
   ```bash
   npm run start
   ```
7. Health Check Path: `/health` or `/api/health`.
8. Configure all environment variables in Section 3.

---

## 6. Production Troubleshooting

### Authentication Errors

#### `"Database error saving new user"` / `"unexpected_failure"`
* **Cause**: The `profiles` table had a `NOT NULL` constraint on `email` and the database trigger function `handle_new_user()` failed during phone-only registration, rolling back the transaction.
* **Resolution**: Ensure you have executed the updated schema where `profiles.email` is nullable and `handle_new_user()` correctly handles both email and phone properties.

### Routing / MIME Type Failures on Vercel
* **Cause**: Next.js paths returning 404 or page assets failing to load with MIME type errors.
* **Resolution**: Remove the Vite-era SPA rewrites from [vercel.json](file:///Users/karthiknaramala/Desktop/golden-silk-emporium/frontend/vercel.json) to let Next.js routing perform naturally.

### CORS Blockage on Razorpay Requests
* **Cause**: Backend rejects client request due to origin headers.
* **Resolution**: In the Render settings, confirm `FRONTEND_URL` is set to your active domain (e.g. `https://drapeva.com`) without a trailing slash.

### Next.js Cache Issues (`routes-manifest.json` ENOENT error)
* **Cause**: Next.js development server fails to read cache files after switching build types or route directories.
* **Resolution**: Delete the local compilation cache and restart the dev server:
  ```bash
  rm -rf frontend/.next
  npm run dev
  ```
