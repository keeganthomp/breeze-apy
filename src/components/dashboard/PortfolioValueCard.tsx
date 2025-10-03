import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { WithdrawModal } from "./WithdrawModal";
import type { MetricsSuccessResponse } from "@/types/api";
import { USDC_FUND } from "@/constants";

interface PortfolioValueCardProps {
  metrics: MetricsSuccessResponse | null;
  portfolioValue: number;
  availableBalance: number;
}

export function PortfolioValueCard({
  metrics,
  portfolioValue,
  availableBalance,
}: PortfolioValueCardProps) {
  const baseAsset = metrics?.summary.baseAsset ?? USDC_FUND.baseAsset;
  const fundId = metrics?.fundId ?? USDC_FUND.id;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    if (!fundId) {
      toast.error("Connect your wallet to prepare a withdrawal");
      return;
    }

    setIsModalOpen(true);
  }, [fundId]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <Card className="relative h-full">
      {availableBalance > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute right-3 top-4 rounded-full px-4 text-[0.6rem] font-semibold uppercase tracking-[0.28em] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-60"
          onClick={handleOpenModal}
          aria-disabled={!fundId}
          data-disabled={!fundId || undefined}
        >
          Withdraw
        </Button>
      )}
      <CardHeader className="space-y-6 pb-6">
        <span className="text-xs font-semibold uppercase tracking-[0.32em] text-bright-pink">
          Working Capital
        </span>
        <div className="text-6xl font-semibold tracking-tight text-deep-purple">
          ${formatNumber(portfolioValue)}
        </div>
      </CardHeader>
      {isModalOpen ? (
        <WithdrawModal
          isOpen
          onClose={handleCloseModal}
          baseAsset={baseAsset}
          fundId={fundId}
          availableBalance={availableBalance}
        />
      ) : null}
    </Card>
  );
}
