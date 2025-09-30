import { Card, CardHeader } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";
import type { MetricsSuccessResponse } from "@/types/api";

interface APYCardProps {
  metrics: MetricsSuccessResponse | null;
  isLoading: boolean;
}

export function APYCard({ metrics, isLoading }: APYCardProps) {
  const currentApy = metrics?.summary.currentApy ?? 0;

  return (
    <Card className="relative h-full overflow-hidden border-none bg-faint-pink">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_60%)]" />
      <CardHeader className="relative z-10 space-y-6 pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
          Current APY
        </span>
        <div className="text-6xl font-semibold tracking-tight text-bright-pink">
          {isLoading ? "-" : formatPercent(currentApy)}
        </div>
      </CardHeader>
    </Card>
  );
}
