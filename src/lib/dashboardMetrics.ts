import { normaliseWithDecimals } from "@/lib/utils";
import type { MetricsSuccessResponse, TokenBalanceEntry } from "@/types/api";
import { BaseAssetInfo } from "@/types/api";
import BigNumber from "bignumber.js";

import { USDC_FUND } from "@/constants";

// Helper function to handle precise decimal arithmetic using BigNumber
function preciseSubtract(a: number, b: number, decimals: number = 6): number {
  const aBN = new BigNumber(a);
  const bBN = new BigNumber(b);
  return aBN.minus(bBN).dp(decimals).toNumber();
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

  // Calculate earningTotal using BigNumber for precision
  const principalBN = new BigNumber(principal);
  const earnedBN = new BigNumber(earned);
  const earningTotalBN = principalBN.plus(earnedBN);
  const earningTotal = BigNumber.max(earningTotalBN, 0).toNumber();

  const idleCapital = preciseSubtract(totalBalance, earningTotal, decimals);

  // Calculate combined total using BigNumber
  const idleCapitalBN = new BigNumber(idleCapital);
  const combinedBN = earningTotalBN.plus(idleCapitalBN);
  const combined = BigNumber.max(combinedBN, 0).toNumber();

  // Calculate percentages using BigNumber for precision
  const earningPercent =
    combined > 0
      ? new BigNumber(earningTotal).div(combined).multipliedBy(100).toNumber()
      : 0;
  const idlePercent =
    combined > 0
      ? new BigNumber(idleCapital).div(combined).multipliedBy(100).toNumber()
      : 0;

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
