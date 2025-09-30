import { useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import type { MetricsSuccessResponse } from "@/types/api";

interface APYCardProps {
  metrics: MetricsSuccessResponse | null;
  isLoading: boolean;
}

export function APYCard({ metrics, isLoading }: APYCardProps) {
  const currentApy = metrics?.summary.currentApy ?? 0;
  const lastUpdatedRaw = metrics?.summary.lastUpdated;

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdatedRaw) {
      return null;
    }

    const date = new Date(lastUpdatedRaw);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  }, [lastUpdatedRaw]);

  return (
    <Card className="relative h-full overflow-hidden border-none bg-faint-pink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_60%)]" />

      <CardHeader className="relative z-10 pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
          Current APY
        </span>
        <p className="text-sm text-muted-foreground font-light">Annual percentage yield</p>
      </CardHeader>

      <CardContent className="relative z-10 space-y-4 pt-0">
        <div className="text-6xl font-semibold tracking-tight text-bright-pink">
          {isLoading ? "-" : formatPercent(currentApy)}
        </div>
        <p className="text-xs text-muted-foreground">
          {lastUpdatedLabel
            ? `Last updated ${lastUpdatedLabel}`
            : "Awaiting latest data"}
        </p>
      </CardContent>
    </Card>
  );
}
