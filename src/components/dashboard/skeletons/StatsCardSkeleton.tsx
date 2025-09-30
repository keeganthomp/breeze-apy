import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
