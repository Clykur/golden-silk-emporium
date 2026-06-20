import os
import re

SRC_DIR = "frontend/src/routes"
DST_DIR = "frontend/app"

route_mappings = {
    # Public pages
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
    
    # Collections
    "collections/index.tsx": "collections/page.tsx",
    "collections/$slug.tsx": "collections/[slug]/page.tsx",
    
    # Auth
    "auth/login.tsx": "login/page.tsx",
    "auth/register.tsx": "register/page.tsx",
    "auth/forgot-password.tsx": "forgot-password/page.tsx",
    "auth/reset-password.tsx": "reset-password/page.tsx",
    "auth/verify.tsx": "verify/page.tsx",
    "auth/otp.tsx": "otp/page.tsx",
    
    # User Account Dashboard
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
    
    # Admin Panel
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
}

def migrate_file(rel_src, rel_dst):
    src_path = os.path.join(SRC_DIR, rel_src)
    dst_path = os.path.join(DST_DIR, rel_dst)
    
    if not os.path.exists(src_path):
        print(f"Source file not found: {src_path}")
        return
        
    print(f"Migrating: {src_path} -> {dst_path}")
    
    with open(src_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Skip if root layout / index / product.$id which we handled
    if "createFileRoute" not in content and "createRootRouteWithContext" not in content:
        # Check if already Next file or non-route helper
        return

    # Add use client
    new_content = '"use client";\n\n'
    
    # Replace @tanstack/react-router imports
    # Match: import { ... } from "@tanstack/react-router";
    router_import_pattern = r'import\s+\{[^}]*\}\s+from\s+["\']@tanstack/react-router["\'];?'
    new_imports = 'import Link from "next/link";\nimport { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";'
    content = re.sub(router_import_pattern, new_imports, content)
    
    # Replace Route definitions
    # Match: export const Route = createFileRoute(...)({ ... });
    route_def_pattern = r'export\s+const\s+Route\s+=\s+createFileRoute\([^\)]*\)\(\{[^}]*\}\);?'
    # Sometimes it spans multiple lines:
    route_def_pattern_multi = r'export\s+const\s+Route\s+=\s+createFileRoute\([^\)]*\)\(\s*\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}\s*\);?'
    content = re.sub(route_def_pattern_multi, "", content)
    content = re.sub(route_def_pattern, "", content)
    
    # Replace Route.useSearch() and Route.useParams() and Route.useRouteContext()
    content = re.sub(r'Route\.useParams\(\)', "useParams()", content)
    content = re.sub(r'Route\.useSearch\(\)', "useSearchParams()", content)
    content = re.sub(r'Route\.useRouteContext\(\)', "{}", content)
    
    # Replace useNavigate hook
    content = re.sub(r'const\s+navigate\s+=\s+useNavigate\(\);?', 'const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams();', content)
    
    # Replace navigate calls
    # Match: navigate({ to: "/auth/login", search: { redirect: pathname, ... } })
    # For simplicity, convert navigate({ to: "xyz" }) to router.push("xyz")
    content = re.sub(r'navigate\(\{\s*to:\s*(["\'][^"\']*["\']),\s*search:\s*\{[^}]*\}\s*\}\)', r'router.push(\1)', content)
    content = re.sub(r'navigate\(\{\s*to:\s*(["\'][^"\']*["\'])\s*\}\)', r'router.push(\1)', content)
    content = re.sub(r'navigate\(\{\s*to:\s*(["\'][^"\']*["\']),\s*params:\s*\{[^}]*\}\s*\}\)', r'router.push(\1)', content)
    
    # Replace Link to with href
    # Match: <Link to="/shop" -> <Link href="/shop"
    # Match: <Link to="/product/$id" params={{ id: p.id }} -> <Link href={`/product/${p.id}`}
    # We will do some specific regexes:
    content = re.sub(r'<Link\s+to=(["\'][^"\']*["\'])\s+search=\{\{\}\}', r'<Link href=\1', content)
    content = re.sub(r'<Link\s+to=(["\'][^"\']*["\'])\s+search=\{[^}]*\}', r'<Link href=\1', content)
    content = re.sub(r'<Link\s+to="/product/\$id"\s+params=\{\{\s*id:\s*([^}]+)\s*\}\}', r'<Link href={`/product/${\1}`}', content)
    content = re.sub(r'<Link\s+to="/collections/\$slug"\s+params=\{\{\s*slug:\s*([^}]+)\s*\}\}', r'<Link href={`/collections/${\1}`}', content)
    content = re.sub(r'<Link\s+to=(["\'][^"\']*["\'])', r'<Link href=\1', content)
    
    # Replace other general Link to=
    content = re.sub(r'\sto=(["\'][^"\']*["\'])', r' href=\1', content)
    
    # Convert dashboard references to account
    content = re.sub(r'["\']/dashboard(["\'])', r'"/account\1"', content)
    content = re.sub(r'["\']/dashboard/([^"\'\n]+)["\']', r'"/account/\1"', content)
    
    # Convert auth references to standard paths
    content = re.sub(r'["\']/auth/login(["\'])', r'"/login\1"', content)
    content = re.sub(r'["\']/auth/register(["\'])', r'"/register\1"', content)
    content = re.sub(r'["\']/auth/forgot-password(["\'])', r'"/forgot-password\1"', content)
    content = re.sub(r'["\']/auth/reset-password(["\'])', r'"/reset-password\1"', content)
    content = re.sub(r'["\']/auth/verify(["\'])', r'"/verify\1"', content)
    content = re.sub(r'["\']/auth/otp(["\'])', r'"/otp\1"', content)
    
    # Export default for component functions
    # Find functions: function AboutUs(), function Shop(), etc.
    # We want to change them to: export default function AboutUs()
    funcs_to_default = ["AboutUs", "Bestsellers", "BookAppointment", "CelebrityLooks", "Compare", "Lookbook", 
                        "NewArrivals", "Search", "Shop", "VirtualCatalog", "Wishlist", "Checkout", 
                        "CollectionList", "CollectionDetail", "Login", "Register", "ForgotPassword", 
                        "ResetPassword", "VerifyAuth", "OTPAuth", "DashboardOverview", "ProfileSettings", 
                        "OrdersHistory", "SavedAddresses", "NotificationsCenter", "RecentlyViewed", 
                        "ReturnsRefunds", "SecuritySettings", "SupportTickets", "WishlistOverview",
                        "AdminOverview", "ProductsCrud", "CategoriesCrud", "CollectionsCrud", "OrdersManagement", 
                        "CustomersList", "CouponCrud", "ReviewsModeration", "InventoryManagement", 
                        "HomepageManagement", "SupportTicketsManagement", "AuditLogs", "AnalyticsOverview"]
    
    for func in funcs_to_default:
        # Match function FuncName() {
        content = re.sub(fr'function\s+{func}\s*\(', fr'export default function {func}(', content)
        
    new_content += content
    
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    
    with open(dst_path, "w", encoding="utf-8") as f:
        f.write(new_content)

def main():
    for src, dst in route_mappings.items():
        migrate_file(src, dst)
        
if __name__ == "__main__":
    main()
