import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent, slicePublicKey } from "@/lib/utils";
import type { MetricsSuccessResponse, TokenBalanceEntry } from "@/types/api";
import type { CapitalBreakdown } from "@/lib/dashboardMetrics";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";

interface StatsCardProps {
  metrics: MetricsSuccessResponse | null;
  portfolioValue: number;
  capitalBreakdown: CapitalBreakdown;
  baseAssetBalance?: TokenBalanceEntry | null;
}

export function StatsCard({
  metrics,
  portfolioValue,
  capitalBreakdown,
  baseAssetBalance,
}: StatsCardProps) {
  const { publicKey } = useWallet();

  const baseAsset =
    capitalBreakdown.baseAsset ?? metrics?.summary.baseAsset ?? "USDC";
  const totalYieldEarned = metrics?.summary.totalYieldEarned ?? 0;
  const currentApy = metrics?.summary.currentApy ?? 0;
  const daysInFund = metrics?.summary.daysInFund;
  const entryDate = metrics?.summary.entryDate;
  const fundWideApy = baseAssetBalance?.yieldBalance?.fundApy;

  const fundDisplayName = slicePublicKey(metrics?.fundId);
  const userAddress = publicKey?.toBase58();
  const userDisplayName = slicePublicKey(userAddress);

  const timeInFundLabel = (() => {
    if (daysInFund === undefined) {
      return null;
    }

    if (daysInFund <= 0) {
      return "Earning <1 day";
    }

    if (daysInFund === 1) {
      return "Earning for 1 day";
    }

    if (daysInFund < 7) {
      return `Earning for ${daysInFund} days`;
    }

    if (daysInFund < 30) {
      const weeks = Math.floor(daysInFund / 7);
      return `Earning for ${weeks} week${weeks === 1 ? "" : "s"}`;
    }

    const months = Math.floor(daysInFund / 30);
    return `Earning for ${months} month${months === 1 ? "" : "s"}`;
  })();

  const entryDateLabel = (() => {
    if (!entryDate) {
      return null;
    }

    const parsed = new Date(entryDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  const handleCopyFundId = async () => {
    if (!metrics?.fundId) return;

    try {
      await navigator.clipboard.writeText(metrics.fundId);
      toast.success("Fund ID copied to clipboard");
    } catch {
      toast.error("Failed to copy Fund ID");
    }
  };

  const handleCopyUserId = async () => {
    if (!userAddress) return;

    try {
      await navigator.clipboard.writeText(userAddress);
      toast.success("User ID copied to clipboard");
    } catch {
      toast.error("Failed to copy User ID");
    }
  };

  const cadenceBreakdown = (() => {
    const earningCapital = capitalBreakdown.earningTotal || portfolioValue;
    const estimatedAnnualEarnings = earningCapital * (currentApy / 100);
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
          {timeInFundLabel ? (
            <span className="rounded-full bg-muted px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {timeInFundLabel}
            </span>
          ) : null}
        </div>
        <p className="text-2xl font-semibold text-deep-purple truncate">
          +{totalYieldEarned} {baseAsset.symbol}
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground">
            {baseAsset.symbol} Fund
          </span>
          {entryDateLabel ? (
            <span className="text-muted-foreground/70">
              Joined {entryDateLabel}
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col justify-between h-full">
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
                +{formatNumber(item.value)} {baseAsset.symbol}
              </dd>
            </div>
          ))}
        </dl>

        <div className="space-y-3 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Current APY</span>
            <span className="font-semibold text-foreground">
              {formatPercent(currentApy)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Fund APY</span>
            <span className="font-semibold text-foreground">
              {fundWideApy !== undefined ? formatPercent(fundWideApy) : "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Amount Earning Yield</span>
            <span className="font-semibold text-foreground">
              ${formatNumber(capitalBreakdown.earningTotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span>Fund ID</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyFundId}
                className="ml-2 h-3 w-3 p-0 text-muted-foreground/70 hover:bg-muted/50"
                disabled={!metrics?.fundId}
              >
                <Copy className="h-2 w-2" />
              </Button>
            </div>
            <span className="font-semibold text-foreground">
              {fundDisplayName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span>User ID</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyUserId}
                className="ml-2 h-3 w-3 p-0 text-muted-foreground/70 hover:bg-muted/50"
                disabled={!userAddress}
              >
                <Copy className="h-2 w-2" />
              </Button>
            </div>
            <span className="font-semibold text-foreground">
              {userDisplayName}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
