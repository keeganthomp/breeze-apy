import { USDC_DECIMALS, USDC_MINT_ADDRESS } from "@/constants";
import { normaliseWithDecimals } from "@/lib/utils";
import type {
  MetricsSuccessResponse,
  TokenBalanceEntry,
} from "@/types/api";

export type CapitalBreakdown = {
  baseAsset: string;
  principal: number;
  earned: number;
  earningTotal: number;
  idle: number;
  earningPercent: number;
  idlePercent: number;
};

export function resolveBaseAssetCode(metrics: MetricsSuccessResponse | null) {
  const asset = metrics?.summary.baseAsset;
  if (typeof asset === "string" && asset.trim().length > 0) {
    return asset.trim().toUpperCase();
  }

  return "USDC";
}

export function findBaseAssetTokenBalance(
  balances: TokenBalanceEntry[] | null | undefined,
  baseAssetCode: string
) {
  if (!balances || balances.length === 0) {
    return null;
  }

  const target = baseAssetCode.toUpperCase();

  return (
    balances.find((entry) => {
      const symbol = entry.tokenSymbol?.toUpperCase();
      const name = entry.tokenName?.toUpperCase();

      return (
        entry.tokenAddress === USDC_MINT_ADDRESS ||
        symbol === target ||
        name === target
      );
    }) ?? null
  );
}

type BuildCapitalBreakdownParams = {
  metrics: MetricsSuccessResponse | null;
  baseAssetBalance: TokenBalanceEntry | null;
  portfolioValue: number;
  heldBalanceOverride?: number;
  defaultDecimals?: number;
};

export function buildCapitalBreakdown({
  metrics,
  baseAssetBalance,
  portfolioValue,
  heldBalanceOverride,
  defaultDecimals = USDC_DECIMALS,
}: BuildCapitalBreakdownParams): CapitalBreakdown {
  const baseAsset = resolveBaseAssetCode(metrics);
  const decimals = baseAssetBalance?.decimals ?? defaultDecimals;
  const yieldBalance = baseAssetBalance?.yieldBalance ?? null;

  const principal = yieldBalance
    ? normaliseWithDecimals(yieldBalance.funds, decimals)
    : portfolioValue;

  const earned = yieldBalance
    ? normaliseWithDecimals(yieldBalance.amountOfYield, decimals)
    : metrics?.summary.totalYieldEarned ?? 0;

  const earningTotal = Math.max(principal + earned, 0);
  const heldBalance =
    typeof heldBalanceOverride === "number"
      ? heldBalanceOverride
      : baseAssetBalance?.normalizedBalance ?? 0;
  const idle = Math.max(heldBalance - earningTotal, 0);
  const combined = Math.max(earningTotal + idle, 0);

  const earningPercent = combined > 0 ? (earningTotal / combined) * 100 : 0;
  const idlePercent = combined > 0 ? (idle / combined) * 100 : 0;

  return {
    baseAsset,
    principal,
    earned,
    earningTotal,
    idle,
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
