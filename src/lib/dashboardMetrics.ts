import { normaliseWithDecimals } from "@/lib/utils";
import type { MetricsSuccessResponse, TokenBalanceEntry } from "@/types/api";
import { BaseAssetInfo } from "@/types/api";

import { USDC_FUND } from "@/constants";

// Helper function to handle precise decimal arithmetic
function preciseSubtract(a: number, b: number, decimals: number = 6): number {
  const factor = Math.pow(10, decimals);
  return Math.round(a * factor - b * factor) / factor;
}

export type CapitalBreakdown = {
  baseAsset: BaseAssetInfo;
  principal: number;
  earned: number;
  earningTotal: number;
  idle: number;
  earningPercent: number;
  idlePercent: number;
};

type BuildCapitalBreakdownParams = {
  metrics: MetricsSuccessResponse | null;
  walletTokenBalance: TokenBalanceEntry | null;
  portfolioValue: number;
  heldBalanceOverride?: number;
  defaultDecimals?: number;
};

export function buildCapitalBreakdown({
  metrics,
  walletTokenBalance,
  portfolioValue,
  defaultDecimals = USDC_FUND.baseAsset.decimals,
}: BuildCapitalBreakdownParams): CapitalBreakdown {
  const baseAsset = metrics?.summary.baseAsset;
  const decimals = walletTokenBalance?.decimals ?? defaultDecimals;
  const yieldBalance = walletTokenBalance?.yieldBalance ?? null;
  // amount in fund + amount in wallet
  const totalBalance = walletTokenBalance?.normalizedBalance ?? 0;

  const principal = yieldBalance
    ? normaliseWithDecimals(yieldBalance.funds, decimals)
    : portfolioValue;

  const earned = yieldBalance
    ? normaliseWithDecimals(yieldBalance.amountOfYield, decimals)
    : metrics?.summary.totalYieldEarned ?? 0;

  const idleCapital = preciseSubtract(totalBalance, principal + earned, decimals - 1);

  const earningTotal = Math.max(principal + earned, 0);
  const combined = Math.max(earningTotal + idleCapital, 0);

  const earningPercent = combined > 0 ? (earningTotal / combined) * 100 : 0;
  const idlePercent = combined > 0 ? (idleCapital / combined) * 100 : 0;

  return {
    baseAsset: baseAsset ?? USDC_FUND.baseAsset,
    principal,
    earned,
    earningTotal,
    idle: idleCapital,
    earningPercent,
    idlePercent,
  };
}

export function formatLastUpdatedLabel(lastUpdated?: string | null) {
  if (!lastUpdated) {
    return null;
  }

  const parsed = new Date(lastUpdated);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const diffMs = Date.now() - parsed.getTime();

  if (diffMs < 60 * 1000) {
    return "Updated just now";
  }

  const diffMinutes = Math.floor(diffMs / (60 * 1000));
  if (diffMinutes < 60) {
    return `Updated ${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
