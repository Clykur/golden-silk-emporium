# Deployment Guide - Golden Silk Emporium (Maaya Couture)

This guide documents the procedures for local development and production launch of both the frontend client and backend API.

---

## 1. Project Overview

Golden Silk Emporium (Maaya Couture) is organized as an **npm workspaces monorepo** to keep the client and server code co-located while allowing independent building and deployment.

### Repository Structure
```
golden-silk-emporium/          # Monorepo root
├── package.json               # Root monorepo workspace configuration
├── docker-compose.yml         # Dev services (PostgreSQL & Redis)
├── nginx.conf                 # Optional reverse proxy configuration
├── backend/                   # Node.js + Express API backend
│   ├── src/                   # Server source files (controllers, routes, services)
│   ├── prisma/                # Prisma ORM schema and seeding script
│   └── package.json           # Backend dependencies and scripts
└── frontend/                  # TanStack React frontend web application
    ├── src/                   # Client application pages, components, & styles
    ├── public/                # Static public assets
    └── package.json           # Frontend dependencies and scripts
```

* **Frontend Location**: `frontend/`
* **Backend Location**: `backend/`
* **Shared Packages**: None. The monorepo uses npm workspaces primarily to manage dependencies and trigger actions in both projects from the root.

---

## 2. Environment Variables

### Frontend Environment Variables (located in `frontend/.env.local` for development)

| Variable Name | Purpose | Example / Dev Value |
|---|---|---|
| `VITE_API_URL` | Endpoint of the deployed REST API. Client requests are directed here. | `http://localhost:5000/api` |

#### Example `frontend/.env.local`
```env
# Frontend API URL - Points to the backend API endpoint
VITE_API_URL=http://localhost:5000/api
```

---

### Backend Environment Variables (located in `backend/.env` for development)

| Variable Name | Purpose | Example / Dev Value |
|---|---|---|
| `DATABASE_URL` | Connection URL for the PostgreSQL Database. | `postgresql://postgres:postgres@localhost:5432/maaya_couture?schema=public` |
| `PORT` | Local port number the Express server listens on. | `5000` |
| `JWT_SECRET` | Secret key used to sign Auth access tokens. | `super-secret-luxury-token-key-2026` |
| `JWT_REFRESH_SECRET` | Secret key used to sign Auth refresh tokens. | `super-secret-luxury-refresh-token-key-2026` |
| `REDIS_URL` | Redis Cache Connection URL. Set to `"mock"` to bypass Redis. | `redis://localhost:6379` |
| `FRONTEND_URL` | Origin URL of the frontend (for CORS allowance). | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe Payment Gateway API Secret Key (mocked). | `sk_test_mock_stripe_key` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (mocked). | `rzp_test_mock_razorpay_key_id` |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret (mocked). | `rzp_test_mock_razorpay_key_secret` |
| `RESEND_API_KEY` | Resend Email API Key (mocked). | `re_mock_resend_api_key` |
| `CLOUDINARY_URL` | Cloudinary Storage credentials (mocked). | `cloudinary://mock_key:mock_secret@mock_name` |
| `WHATSAPP_API_TOKEN` | WhatsApp Cloud API Token (mocked). | `mock_whatsapp_api_token` |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business Phone ID (mocked). | `mock_whatsapp_phone_number_id` |

#### Example `backend/.env`
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/maaya_couture?schema=public"
PORT=5000
JWT_SECRET="super-secret-luxury-token-key-2026"
JWT_REFRESH_SECRET="super-secret-luxury-refresh-token-key-2026"
STRIPE_SECRET_KEY="sk_test_mock_stripe_key"
RAZORPAY_KEY_ID="rzp_test_mock_razorpay_key_id"
RAZORPAY_KEY_SECRET="rzp_test_mock_razorpay_key_secret"
RESEND_API_KEY="re_mock_resend_api_key"
CLOUDINARY_URL="cloudinary://mock_cloud_key:mock_cloud_secret@mock_cloud_name"
REDIS_URL="redis://localhost:6379"
WHATSAPP_API_TOKEN="mock_whatsapp_api_token"
WHATSAPP_PHONE_NUMBER_ID="mock_whatsapp_phone_number_id"
FRONTEND_URL="http://localhost:3000"
```

---

## 3. Local Development Setup

### Prerequisites
* **Node.js** (v18.x or newer)
* **npm** (v9.x or newer)
* **Docker** & **Docker Compose** (optional but recommended for running DB/Cache services)

### Step 1: Clone and Install Dependencies
From the repository root, install dependencies for both the frontend and backend using workspaces:
```bash
npm install
```

### Step 2: Set Up Database and Cache Infrastructure
If you have Docker installed, start PostgreSQL and Redis locally:
```bash
docker compose up -d
```
*(If Docker is unavailable, configure `DATABASE_URL` in `backend/.env` to point to a native PostgreSQL instance, and set `REDIS_URL="mock"` to use DB fallback querying).*

### Step 3: Run Database Migrations and Seeding
Deploy database schemas and seed initial products/collections:
```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema changes to database
npm run prisma:migrate

# Seed database with authentic saree categories, collections, and products
npm run db:seed
```

### Step 4: Run the Applications
Start both client and server development processes:

* **Start Backend API Dev Server**:
  ```bash
  npm run dev:backend
  ```
  *(Server runs at `http://localhost:5000`)*

* **Start Frontend Web App**:
  ```bash
  npm run dev:frontend
  ```
  *(Web application runs at `http://localhost:3000`)*

---

## 4. Backend Deployment (Render)

Render is recommended for hosting the Express backend.

1. **Deploying to Render (Web Services)**:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npx prisma generate && npm run build`
   * **Start Command**: `npm run start`
   * **Health Check Path**: `/health` (This endpoint returns `{ "status": "healthy" }` with HTTP code 200).

2. **Database Configuration**:
   Create a hosted PostgreSQL database (e.g. Render PostgreSQL or Neon DB). Paste the connection string into the backend's environment variables as `DATABASE_URL`. Ensure you run migrations on database creation by adding `npx prisma db push` or `npx prisma migrate deploy` in the build command.
   
3. **Environment Variables**:
   Add the complete set of Environment Variables in the Render Environment tab (refer to Section 2). Ensure `FRONTEND_URL` is set to the URL of the deployed frontend on Vercel to allow CORS.

4. **Troubleshooting Render Deployments**:
   * **Module Not Found**: Ensure the build command includes TypeScript compilation `tsc`.
   * **Prisma Engine Crash**: Verify `npx prisma generate` is executed during the build stage.
   * **CORS Blockage**: Double check that `FRONTEND_URL` exactly matches your frontend domain name without a trailing slash.

---

## 5. Frontend Deployment (Vercel)

Vercel is recommended for deploying the TanStack React frontend.

1. **Deploying to Vercel**:
   * **Root Directory**: `frontend`
   * **Framework Preset**: `Vite` (or `Other` / Auto)
   * **Build Command**: `npm run build`
   * **Output Directory**: `.output` (Vercel auto-detects this for TanStack Start / Nitro builds)
   * **Install Command**: `npm install`

2. **Environment Variables**:
   * Set `VITE_API_URL` to the URL of your Render backend API service (e.g., `https://maaya-api.onrender.com/api`).

3. **API Configuration**:
   TanStack Start compiles routes dynamically. Verify routing redirects are in place for client-side fallbacks if using standard SPA routers.

4. **Troubleshooting Vercel Deployments**:
   * **API Connection Refused**: Verify that `VITE_API_URL` has no trailing slash and includes `/api`.
   * **Hydration Failure**: Check for platform-specific client/server rendering mismatches (TanStack routing issues).
   * **Vite Compile Failure**: Ensure that TypeScript versions are matching and typescript compile passes locally with `npm run build` before pushing.

---

## 6. Production Verification Checklist

Before opening the storefront to the public, perform this checklist:

- [ ] **Frontend Builds Successfully**: Verify `npm run build` completes on the frontend without errors.
- [ ] **Backend Builds Successfully**: Verify `npm run build` completes on the backend without compilation errors.
- [ ] **Database Connected**: Verify that DB queries execute (check logs for successful seeding or product load).
- [ ] **Authentication Working**: Log in and out with user accounts (`customer@maayacouture.com`) and verify access tokens are stored and refreshed.
- [ ] **Images Loading Correctly**: Browse collections and product cards. Ensure no blank boxes, broken images, or placeholding graphics appear.
- [ ] **Product Pages Working**: Open single product routes (e.g. `/product/noor-crimson`). Validate description and images are shown.
- [ ] **API Endpoints Responding**: Check `/health` endpoint responds with a 200 HTTP status.
- [ ] **Mobile Responsiveness Verified**: Test storefront layouts on simulated mobile resolutions (navbar, product details, checkout flow).
- [ ] **No Console Errors**: Open browser inspector tool and confirm no red network failures or syntax uncaught exceptions.
- [ ] **No Broken Links**: Check that navigation items (Story, Catalog, Shop) point to valid paths.
- [ ] **No Missing Assets**: Ensure logo, icons, and text fonts load.

---

## 7. Troubleshooting Guide

### Common Startup Errors

#### `bun: command not found`
* **Cause**: Backend package scripts were originally written using Bun (`bun --watch` / `bun seed.ts`), but Bun is not installed in the current environment.
* **Resolution**: The backend package has been migrated to standard Node execution. Use `npm run dev:backend` which runs `tsx watch src/index.ts` natively on Node, and `npm run db:seed` which executes `tsx prisma/seed.ts`.

#### `Port 5000 / 3000 already in use`
* **Cause**: Another dev server is running or a ghost process is occupying the listening port.
* **Resolution**: Locate the process using `lsof -i :5000` (macOS/Linux) and terminate it using `kill -9 <PID>`. Alternatively, change the `PORT` env variable.

### Database Connection Issues

#### `P1001: Can't reach database server at localhost:5432`
* **Cause**: PostgreSQL is not running locally.
* **Resolution**: Check if Docker is running (`docker ps`). Start the container using `docker compose up -d`. If using native PostgreSQL, ensure the service is active (`brew services start postgresql` on Mac).

#### `Prisma schema out of sync`
* **Cause**: Database structure was changed but client types were not generated.
* **Resolution**: Run `npm run prisma:generate` at the root folder.

### CORS Errors

#### `Access-Control-Allow-Origin header missing or mismatched`
* **Cause**: Frontend origin URL does not match backend's allowed CORS origins list.
* **Resolution**: In the backend config/environment (`.env`), set `FRONTEND_URL` to match your frontend client URL (e.g. `http://localhost:3000` for development or `https://your-app.vercel.app` for production). Ensure it has no trailing slash.

### Image Loading Failures

#### Images return 404 or show broken asset icons
* **Cause**: Unsplash URLs or local paths are malformed or blocked.
* **Resolution**:
  1. For Unsplash images, ensure URLs contain correct parameter keys (e.g. `auto=format&fit=crop`).
  2. For local images, confirm they are imported using absolute paths starting with `@/assets/` in Vite or are located in the `public` directory.
  3. Ensure all displayed imagery features premium sarees only. The shop is curated strictly for luxury handwoven sarees.
