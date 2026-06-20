import { SkeletonLoader } from "@/components/skeleton-loader";

export default function CartLoading() {
  return (
    <div className="container-luxe py-8">
      <div className="h-16 border-b border-border pb-6 mb-6">
        <div className="h-3 w-16 bg-champagne/30 rounded mb-2 animate-pulse" />
        <div className="h-6 w-48 bg-champagne/50 rounded animate-pulse" />
      </div>
      <SkeletonLoader variant="cart" count={2} />
    </div>
  );
}
