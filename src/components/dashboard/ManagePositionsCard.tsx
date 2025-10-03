import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { BaseAssetInfo, TokenBalanceEntry } from "@/types/api";
import { DepositForm } from "./DepositForm";
import { cn, formatNumber } from "@/lib/utils";
import { USDC_BASE_ASSET } from "@/constants";
import BigNumber from "bignumber.js";

interface ManagePositionsCardProps {
  tokenBalances: TokenBalanceEntry[] | null;
  idleCapital?: number;
  baseAsset?: BaseAssetInfo;
  className?: string;
}

export function ManagePositionsCard({
  tokenBalances,
  idleCapital = 0,
  baseAsset = USDC_BASE_ASSET,
  className,
}: ManagePositionsCardProps) {
  const availableCapital = BigNumber.max(idleCapital, 0).toNumber();
  const decimalsForDisplay = BigNumber.max(
    baseAsset.decimals - 2,
    0
  ).toNumber();

  return (
    <Card className={cn("flex h-full flex-col justify-between", className)}>
      <CardHeader className="space-y-5 pb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
            Capital Allocation
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-light">
          Allocate more capital into the Breeze fund to increase your returns
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <DepositForm
          baseAsset={baseAsset}
          balances={tokenBalances}
          availableAmount={availableCapital}
        />
        {availableCapital > 0 && (
          <p className="text-xs text-muted-foreground font-light">
            {formatNumber(availableCapital, decimalsForDisplay)}{" "}
            {baseAsset.symbol} available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
