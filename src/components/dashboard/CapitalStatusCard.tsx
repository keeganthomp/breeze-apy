import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/utils";
import type { CapitalBreakdown } from "@/lib/dashboardMetrics";

interface CapitalStatusCardProps {
  breakdown: CapitalBreakdown;
}

export function CapitalStatusCard({ breakdown }: CapitalStatusCardProps) {
  const {
    baseAsset,
    principal,
    earned,
    earningTotal,
    idle,
    earningPercent,
    idlePercent,
  } = breakdown;

  const earningWidth = Math.min(Math.max(earningPercent, 0), 100);
  const idleWidth = Math.min(Math.max(idlePercent, 0), 100 - earningWidth);

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
          Snapshot of how your {baseAsset} is allocated across Breeze.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-bright-pink/80"
            style={{ width: `${earningWidth}%` }}
          />
          <div
            className="h-full bg-muted-foreground/20"
            style={{ width: `${idleWidth}%` }}
          />
        </div>

        <dl className="grid gap-4 text-xs sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">
              Principal Allocated
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              ${formatNumber(principal)} {baseAsset}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">
              Yield Accrued
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              +{formatNumber(earned)} {baseAsset}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">
              Currently Earning
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              ${formatNumber(earningTotal)} {baseAsset}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="uppercase tracking-[0.18em] text-muted-foreground">
              Idle Capital
            </dt>
            <dd className="text-sm font-semibold text-foreground">
              ${formatNumber(idle)} {baseAsset}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
