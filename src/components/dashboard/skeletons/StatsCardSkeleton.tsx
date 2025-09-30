import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-2 pb-4">
        <Skeleton className="h-3 w-24 rounded-sm" />
        <Skeleton className="h-3 w-40 rounded-sm" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-sm" />
          <Skeleton className="h-6 w-32 rounded-md" />
        </div>
        <Separator />
        <div className="grid gap-4 sm:grid-cols-2">
          {["positions", "yield"].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24 rounded-sm" />
          <Skeleton className="h-3 w-10 rounded-sm" />
        </div>
      </CardContent>
    </Card>
  );
}
