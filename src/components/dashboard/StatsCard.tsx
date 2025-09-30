import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatNumber, formatPercent, slicePublicKey } from "@/lib/utils";
import type { MetricsSuccessResponse } from "@/types/api";

interface StatsCardProps {
  metrics: MetricsSuccessResponse | null;
  portfolioValue: number;
}

export function StatsCard({ metrics, portfolioValue }: StatsCardProps) {
  const baseAsset = metrics?.summary.baseAsset ?? "USDC";
  const totalYieldEarned = metrics?.summary.totalYieldEarned ?? 0;
  const currentApy = metrics?.summary.currentApy ?? 0;

  const fundDisplayName = slicePublicKey(metrics?.fundId);

  const cadenceBreakdown = (() => {
    const estimatedAnnualEarnings = portfolioValue * (currentApy / 100);
    const estimatedMonthlyEarnings = estimatedAnnualEarnings / 12;
    const estimatedDailyEarnings = estimatedAnnualEarnings / 365;

    return [
      { label: "Per Year", value: estimatedAnnualEarnings },
      { label: "Per Month", value: estimatedMonthlyEarnings },
      { label: "Per Day", value: estimatedDailyEarnings },
    ];
  })();

  return (
    <Card className="h-full">
      <CardHeader className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-bright-pink">
            Total Earned
          </span>
        </div>
        <p className="text-2xl font-semibold text-deep-purple truncate">
          +{totalYieldEarned} {baseAsset}
        </p>
        <p className="text-sm text-muted-foreground font-light">
          Projected earnings across multiple cadences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="space-y-2">
          {cadenceBreakdown.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between border-t border-border/40 pt-3 first:border-t-0 first:pt-0"
            >
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {item.label}
              </dt>
              <dd className="text-sm text-foreground">
                +{formatNumber(item.value)} {baseAsset}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3 border-t border-border/40 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Current APY</span>
            <span className="font-semibold text-foreground">
              {formatPercent(currentApy)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Portfolio Value</span>
            <span className="font-semibold text-foreground">
              ${formatNumber(portfolioValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fund</span>
            <span className="font-semibold text-foreground">
              {fundDisplayName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
