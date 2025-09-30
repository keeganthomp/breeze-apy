import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ManagePositionsCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-5 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-sm" />
            <Skeleton className="h-3 w-48 rounded-sm" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <Skeleton className="h-3 w-28 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-2">
          {["deposit", "withdraw"].map((section) => (
            <div key={section} className="space-y-4">
              <Skeleton className="h-3 w-32 rounded-sm" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
              <Skeleton className="h-3 w-40 rounded-sm" />
              {section === "deposit" ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map((chip) => (
                    <Skeleton key={chip} className="h-7 w-16 rounded-full" />
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
