import { SkeletonLoader } from "@/components/skeleton-loader";

export default function ProductLoading() {
  return (
    <div className="container-luxe py-8">
      <SkeletonLoader variant="product-detail" />
    </div>
  );
}
