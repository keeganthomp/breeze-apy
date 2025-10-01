import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { TokenBalanceEntry } from "@/types/api";
import { DepositForm } from "./DepositForm";
import { cn } from "@/lib/utils";

interface ManagePositionsCardProps {
  tokenBalances: TokenBalanceEntry[] | null;
  className?: string;
}

export function ManagePositionsCard({
  tokenBalances,
  className,
}: ManagePositionsCardProps) {
  const baseAsset = tokenBalances?.[0]?.tokenSymbol ?? "USDC";

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
        <DepositForm baseAsset={baseAsset} balances={tokenBalances} />
      </CardContent>
    </Card>
  );
}
