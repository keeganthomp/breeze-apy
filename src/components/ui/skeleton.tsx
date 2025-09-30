import * as React from "react";

import { cn } from "@/lib/utils";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-skeleton
      className={cn("h-4 w-full rounded-md", className)}
      {...props}
    />
  );
}
