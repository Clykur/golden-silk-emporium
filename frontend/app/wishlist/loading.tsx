import { SkeletonLoader } from "@/components/skeleton-loader";

export default function WishlistLoading() {
  return (
    <div className="container-luxe py-8">
      <SkeletonLoader variant="wishlist" count={1} />
    </div>
  );
}
