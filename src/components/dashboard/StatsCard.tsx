import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, formatPercent, slicePublicKey } from "@/lib/utils";
import type { MetricsSuccessResponse } from "@/types/api";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";

interface StatsCardProps {
  metrics: MetricsSuccessResponse | null;
  portfolioValue: number;
}

export function StatsCard({ metrics, portfolioValue }: StatsCardProps) {
  const { publicKey } = useWallet();
  const baseAsset = metrics?.summary.baseAsset ?? "USDC";
  const totalYieldEarned = metrics?.summary.totalYieldEarned ?? 0;
  const currentApy = metrics?.summary.currentApy ?? 0;

  const fundDisplayName = slicePublicKey(metrics?.fundId);
  const userAddress = publicKey?.toBase58();
  const userDisplayName = slicePublicKey(userAddress);

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

        <div className="space-y-3 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Current APY</span>
            <span className="font-semibold text-foreground">
              {formatPercent(currentApy)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Amount Earning Yield</span>
            <span className="font-semibold text-foreground">
              ${formatNumber(portfolioValue)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span>Fund ID</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyFundId}
                className="h-3 w-3 p-0 text-muted-foreground/70 hover:bg-muted/50 ml-2"
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
                className="h-3 w-3 p-0 text-muted-foreground/70 hover:bg-muted/50 ml-2"
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
