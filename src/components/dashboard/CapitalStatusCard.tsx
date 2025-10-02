import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { CapitalBreakdown } from "@/lib/dashboardMetrics";

interface CapitalStatusCardProps {
  breakdown: CapitalBreakdown;
}

export function CapitalStatusCard({ breakdown }: CapitalStatusCardProps) {
  const { baseAsset, principal, idle, earningPercent } = breakdown;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-5 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
            Capital Status
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {formatPercent(earningPercent)} earning
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-light">
          Snapshot of how your {baseAsset.symbol} is allocated across Breeze.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid gap-4 text-xs sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">
              Principal Allocated
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              ${formatNumber(principal)} {baseAsset.symbol}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">
              Idle Capital
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              ${formatNumber(idle)} {baseAsset.symbol}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
