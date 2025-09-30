import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function APYCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border-none">
      <div className="absolute inset-0 bg-muted" aria-hidden />
      <CardHeader className="relative z-10 flex flex-row items-start justify-between space-y-0 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="h-3 w-40 rounded-sm" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </CardHeader>
      <CardContent className="relative z-10 space-y-4 pt-0">
        <Skeleton className="h-12 w-28 rounded-lg" />
        <Skeleton className="h-3 w-36 rounded-sm" />
      </CardContent>
    </Card>
  );
}
