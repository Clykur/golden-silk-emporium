import fs from "fs";
import path from "path";

const SRC_DIR = "frontend/src/routes";
const DST_DIR = "frontend/app";

const routeMappings = {
  // Public pages
  "about.tsx": "about/page.tsx",
  "bestsellers.tsx": "bestsellers/page.tsx",
  "book-appointment.tsx": "book-appointment/page.tsx",
  "celebrity-looks.tsx": "celebrity-looks/page.tsx",
  "compare.tsx": "compare/page.tsx",
  "lookbook.tsx": "lookbook/page.tsx",
  "new-arrivals.tsx": "new-arrivals/page.tsx",
  "search.tsx": "search/page.tsx",
  "shop.tsx": "shop/page.tsx",
  "virtual-catalog.tsx": "virtual-catalog/page.tsx",
  "wishlist.tsx": "wishlist/page.tsx",
  "checkout.tsx": "checkout/page.tsx",

  // Collections
  "collections/index.tsx": "collections/page.tsx",
  "collections/$slug.tsx": "collections/[slug]/page.tsx",

  // Auth
  "auth/login.tsx": "login/page.tsx",
  "auth/register.tsx": "register/page.tsx",
  "auth/forgot-password.tsx": "forgot-password/page.tsx",
  "auth/reset-password.tsx": "reset-password/page.tsx",
  "auth/verify.tsx": "verify/page.tsx",
  "auth/otp.tsx": "otp/page.tsx",

  // User Account Dashboard
  "dashboard/index.tsx": "account/page.tsx",
  "dashboard/profile.tsx": "account/profile/page.tsx",
  "dashboard/orders.tsx": "account/orders/page.tsx",
  "dashboard/addresses.tsx": "account/addresses/page.tsx",
  "dashboard/notifications.tsx": "account/notifications/page.tsx",
  "dashboard/recently-viewed.tsx": "account/recently-viewed/page.tsx",
  "dashboard/returns.tsx": "account/returns/page.tsx",
  "dashboard/security.tsx": "account/security/page.tsx",
  "dashboard/support.tsx": "account/support/page.tsx",
  "dashboard/wishlist.tsx": "account/wishlist/page.tsx",

  // Admin Panel
  "admin/index.tsx": "admin/dashboard/page.tsx",
  "admin/products.tsx": "admin/products/page.tsx",
  "admin/categories.tsx": "admin/categories/page.tsx",
  "admin/collections.tsx": "admin/collections/page.tsx",
  "admin/orders.tsx": "admin/orders/page.tsx",
  "admin/customers.tsx": "admin/customers/page.tsx",
  "admin/coupons.tsx": "admin/coupons/page.tsx",
  "admin/reviews.tsx": "admin/reviews/page.tsx",
  "admin/inventory.tsx": "admin/inventory/page.tsx",
  "admin/homepage.tsx": "admin/homepage/page.tsx",
  "admin/support.tsx": "admin/support/page.tsx",
  "admin/audit-logs.tsx": "admin/audit-logs/page.tsx",
  "admin/analytics.tsx": "admin/analytics/page.tsx",
};

function stripRouteDefinition(content) {
  const marker = "export const Route = createFileRoute";
  const idx = content.indexOf(marker);
  if (idx === -1) return content;

  let parenCount = 0;
  let braceCount = 0;
  let inString = null;
  let foundConfigStart = false;
  let i = idx + marker.length;

  while (i < content.length) {
    const char = content[i];
    if (inString) {
      if (char === inString && content[i - 1] !== "\\") {
        inString = null;
      }
      i++;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      i++;
      continue;
    }

    if (char === "(") {
      parenCount++;
      if (parenCount === 2) {
        foundConfigStart = true;
      }
    } else if (char === ")") {
      parenCount--;
    } else if (char === "{") {
      braceCount++;
    } else if (char === "}") {
      braceCount--;
    }

    if (foundConfigStart && parenCount === 0 && braceCount === 0) {
      let endIdx = i + 1;
      if (content[endIdx] === ";") endIdx++;
      return content.slice(0, idx) + content.slice(endIdx);
    }
    i++;
  }
  return content;
}

function migrateFile(relSrc, relDst) {
  const srcPath = path.join(SRC_DIR, relSrc);
  const dstPath = path.join(DST_DIR, relDst);

  if (!fs.existsSync(srcPath)) {
    console.log(`Source file not found: ${srcPath}`);
    return;
  }

  console.log(`Migrating: ${srcPath} -> ${dstPath}`);

  let content = fs.readFileSync(srcPath, "utf8");

  // Skip if we shouldn't migrate or it's not a createFileRoute file
  if (!content.includes("createFileRoute") && !content.includes("createRootRouteWithContext")) {
    return;
  }

  // Strip the Route definition
  content = stripRouteDefinition(content);

  // Replace TanStack Router imports
  content = content.replace(
    /import\s+\{[^}]*\}\s+from\s+["']@tanstack\/react-router["'];?/g,
    'import Link from "next/link";\nimport { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";',
  );

  // Replace useNavigate
  content = content.replace(
    /const\s+navigate\s+=\s+(?:Route\.)?useNavigate\(\);?/g,
    "const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();",
  );

  // Replace search parameter destructuring BEFORE replacing general useSearch()
  content = content.replace(
    /const\s+\{\s*q\s*\}\s*=\s*(?:Route\.)?useSearch\(\);?/g,
    'const searchParams = useSearchParams(); const q = searchParams.get("q") || "";',
  );
  content = content.replace(
    /const\s+\{\s*token\s*\}\s*=\s*(?:Route\.)?useSearch\(\);?/g,
    'const searchParams = useSearchParams(); const token = searchParams.get("token") || "";',
  );
  content = content.replace(
    /const\s+\{\s*redirect,\s*message\s*\}\s*=\s*(?:Route\.)?useSearch\(\);?/g,
    'const searchParams = useSearchParams(); const redirect = searchParams.get("redirect") || ""; const message = searchParams.get("message") || "";',
  );
  content = content.replace(
    /const\s+\{\s*category,\s*fabric,\s*collection,\s*occasion,\s*search:\s*searchParam\s*\}\s*=\s*(?:Route\.)?useSearch\(\);?/g,
    'const searchParams = useSearchParams(); const category = searchParams.get("category") || undefined; const fabric = searchParams.get("fabric") || undefined; const collection = searchParams.get("collection") || undefined; const occasion = searchParams.get("occasion") || undefined; const searchParam = searchParams.get("search") || undefined;',
  );

  // Replace Route hooks
  content = content.replace(/Route\.useParams\(\)/g, "useParams()");
  content = content.replace(/Route\.useSearch\(\)/g, "useSearchParams()");
  content = content.replace(/Route\.useRouteContext\(\)/g, "{}");

  // Replace navigate calls
  content = content.replace(
    /router\.navigate\(\{\s*to:\s*(["'`]([^"'`]+)["'`])\s*\}\)/g,
    "router.push($1)",
  );
  content = content.replace(
    /navigate\(\{\s*to:\s*(["'`]([^"'`]+)["'`])\s*\}\)/g,
    "router.push($1)",
  );

  // Handle specific navigate structures
  content = content.replace(
    /navigate\(\{\s*search:\s*\{\s*q:\s*query\s*\}\s*\}\)/g,
    "router.push(`/search?q=${encodeURIComponent(query)}`)",
  );

  // For login redirect search params
  content = content.replace(
    /navigate\(\{\s*to:\s*(["'/auth/login"|'\/auth\/login']),\s*search:\s*\{\s*redirect:\s*(["'/checkout"|'\/checkout']),\s*message:\s*(["'][^"']+["'])\s*\}\s*\}\)/g,
    'router.push($1 + "?redirect=" + encodeURIComponent($2) + "&message=" + encodeURIComponent($3))',
  );
  content = content.replace(
    /router\.navigate\(\{\s*to:\s*(["'/auth/login"|'\/auth\/login'])\s*\}\)/g,
    "router.push($1)",
  );
  content = content.replace(
    /router\.navigate\(\{\s*to:\s*redirect\s*(?:as\s+any\s*)?\}\)/g,
    "router.push(redirect)",
  );

  // Replace Link to with href (more specific to more general)
  content = content.replace(
    /<Link\s+to="\/product\/\$id"\s+params=\{\{\s*id:\s*([^}]+)\s*\}\}/g,
    "<Link href={`/product/${$1}`}",
  );
  content = content.replace(
    /<Link\s+to="\/collections\/\$slug"\s+params=\{\{\s*slug:\s*([^}]+)\s*\}\}/g,
    "<Link href={`/collections/${$1}`}",
  );
  content = content.replace(
    /to="\/shop"\s+search=\{\{\s*collection:\s*([^}]+)\s*\}\}/g,
    "href={`/shop?collection=${$1}`}",
  );
  content = content.replace(
    /to="\/shop"\s+search=\{\{\s*category:\s*([^}]+)\s*\}\}/g,
    "href={`/shop?category=${$1}`}",
  );
  content = content.replace(/to="\/shop"\s+search=\{\{\}\}/g, 'href="/shop"');
  content = content.replace(/to=(["'])([^"'\n]+)\1\s+search=\{\{\}\}/g, "href=$1$2$1");
  content = content.replace(/to=(["'])([^"'\n]+)\1\s+search=\{\{[^}]*\}\}/g, "href=$1$2$1");
  content = content.replace(/\bto=(["'])([^"'\n]+)\1/g, "href=$1$2$1");

  // Convert dashboard to account
  content = content.replace(/["']\/dashboard["']/g, '"/account"');
  content = content.replace(/["']\/dashboard\/([^"']+)["']/g, '"/account/$1"');

  // Convert auth references to standard paths
  content = content.replace(/["']\/auth\/login["']/g, '"/login"');
  content = content.replace(/["']\/auth\/register["']/g, '"/register"');
  content = content.replace(/["']\/auth\/forgot-password["']/g, '"/forgot-password"');
  content = content.replace(/["']\/auth\/reset-password["']/g, '"/reset-password"');
  content = content.replace(/["']\/auth\/verify["']/g, '"/verify"');
  content = content.replace(/["']\/auth\/otp["']/g, '"/otp"');

  // Convert import.meta.env to process.env
  content = content.replace(
    /import\.meta\.env\.VITE_RAZORPAY_KEY_ID/g,
    "process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID",
  );

  // Export default for component functions
  const funcsToDefault = [
    "AboutUs",
    "Bestsellers",
    "BookAppointment",
    "CelebrityLooks",
    "Compare",
    "Lookbook",
    "NewArrivals",
    "SearchPage",
    "Shop",
    "VirtualCatalog",
    "Wishlist",
    "Checkout",
    "CollectionsIndex",
    "CollectionDetail",
    "Login",
    "Register",
    "ForgotPassword",
    "ResetPassword",
    "VerifyAuth",
    "OTPAuth",
    "DashboardOverview",
    "ProfileSettings",
    "OrdersHistory",
    "SavedAddresses",
    "NotificationsCenter",
    "RecentlyViewed",
    "ReturnsRefunds",
    "SecuritySettings",
    "SupportTickets",
    "WishlistOverview",
    "AdminOverview",
    "ProductsCrud",
    "CategoriesCrud",
    "CollectionsCrud",
    "OrdersManagement",
    "CustomersList",
    "CouponCrud",
    "ReviewsModeration",
    "InventoryManagement",
    "HomepageManagement",
    "SupportTicketsManagement",
    "AuditLogs",
    "AnalyticsOverview",
  ];

  for (const func of funcsToDefault) {
    const reg = new RegExp(`function\\s+${func}\\s*\\(`, "g");
    content = content.replace(reg, `export default function {func}(`.replace("{func}", func));
  }

  // Prepend "use client"
  let newContent = '"use client";\n\n' + content;

  // Create directory if it doesn't exist
  fs.mkdirSync(path.dirname(dstPath), { recursive: true });
  fs.writeFileSync(dstPath, newContent, "utf8");
}

Object.entries(routeMappings).forEach(([src, dst]) => {
  migrateFile(src, dst);
});
console.log("Migration completed successfully!");
