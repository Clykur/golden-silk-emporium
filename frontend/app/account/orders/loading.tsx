import { SkeletonLoader } from "@/components/skeleton-loader";

export default function OrdersLoading() {
  return (
    <div className="space-y-4 py-4">
      <div className="h-5 w-40 bg-champagne/40 rounded animate-pulse" />
      <SkeletonLoader variant="orders" count={3} />
    </div>
  );
}
