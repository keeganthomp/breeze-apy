import { Skeleton } from "@/components/ui/skeleton";

export function ManagePositionsCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col space-y-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-30 w-full" />
    </div>
  );
}
