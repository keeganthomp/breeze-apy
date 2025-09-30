import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { MetricsSuccessResponse } from "@/types/api";

interface EarningsCardProps {
  metrics: MetricsSuccessResponse | null;
}

export function EarningsCard({ metrics }: EarningsCardProps) {
  const baseAsset = metrics?.summary.baseAsset ?? "USDC";
  const portfolioValue = metrics?.summary.totalPortfolioValue ?? 0;
  const totalPositionValue = metrics?.summary.totalPositionValue ?? 0;
  const totalYieldEarned = metrics?.summary.totalYieldEarned ?? 0;

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
          Position Value
        </span>
        <div className="text-3xl font-semibold text-deep-purple">
          {formatNumber(portfolioValue)} {baseAsset}
        </div>
        <p className="text-sm text-muted-foreground font-light">
          Amount currently allocated
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-2">
          <div className="flex items-center justify-between border-t border-border/40 pt-3 first:border-t-0 first:pt-0">
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-deep-purple">
              Capital At Work
            </dt>
            <dd className="text-sm font-medium text-foreground">
              {formatNumber(totalPositionValue)} {baseAsset}
            </dd>
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-3 first:border-t-0 first:pt-0">
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-deep-purple">
              Lifetime Yield
            </dt>
            <dd className="text-sm font-medium text-foreground">
              +{formatNumber(totalYieldEarned)} {baseAsset}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
