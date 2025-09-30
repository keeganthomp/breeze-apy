import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { MetricsSuccessResponse } from "@/types/api";
import { DepositForm } from "./DepositForm";
import { WithdrawForm } from "./WithdrawForm";

interface ManagePositionsCardProps {
  metrics: MetricsSuccessResponse | null;
  fundLabel?: string | null;
}

export function ManagePositionsCard({
  metrics,
}: ManagePositionsCardProps) {
  const baseAsset = metrics?.summary.baseAsset ?? "USDC";
  const canTransact = Boolean(metrics?.fundId);

  return (
    <Card>
      <CardHeader className="pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
          Capital Allocation
        </span>
        <p className="text-sm text-muted-foreground font-light">
          Allocate more capital into the Breeze fund or redeem funds
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {canTransact ? (
          <div className="grid gap-5 md:grid-cols-2">
            <DepositForm metrics={metrics} baseAsset={baseAsset} />
            <WithdrawForm metrics={metrics} baseAsset={baseAsset} />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/60 bg-white/80 p-6 text-sm text-muted-foreground">
            Fund information is unavailable right now. Connect your wallet or
            refresh to try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
