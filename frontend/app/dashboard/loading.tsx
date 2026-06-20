import { SkeletonLoader } from "@/components/skeleton-loader";

export default function DashboardLoading() {
  return (
    <div className="container-luxe py-8">
      <SkeletonLoader variant="dashboard" />
    </div>
  );
}
