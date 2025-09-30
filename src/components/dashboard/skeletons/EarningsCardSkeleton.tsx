import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EarningsCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3 pb-4">
        <Skeleton className="h-3 w-24 rounded-sm" />
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-3 w-32 rounded-sm" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {["year", "month", "day"].map((cadence) => (
            <div
              key={cadence}
              className="rounded-lg border border-dashed border-border/60 bg-muted/60 p-3"
            >
              <Skeleton className="h-3 w-20 rounded-sm" />
              <Skeleton className="mt-3 h-4 w-24 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <Skeleton className="h-3 w-28 rounded-sm" />
            <Skeleton className="h-3 w-16 rounded-sm" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
