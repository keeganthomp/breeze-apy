"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMetrics, useRefetchData, useTokenBalances } from "@/hooks";
import {
  Header,
  ErrorDisplay,
  ManagePositionsCard,
  APYCard,
  PortfolioValueCard,
  StatsCard,
  CapitalStatusCard,
  ManagePositionsCardSkeleton,
  APYCardSkeleton,
  PortfolioValueCardSkeleton,
  StatsCardSkeleton,
  AuthGuard,
} from "@/components/dashboard";
import { useWallet } from "@solana/wallet-adapter-react";
import { USDC_DECIMALS, USDC_MINT_ADDRESS } from "@/constants";
import { normaliseWithDecimals } from "@/lib/utils";
import type { CapitalBreakdown } from "@/components/dashboard/CapitalStatusCard";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCw } from "lucide-react";

function DashboardContent() {
  const { publicKey, connecting, connected } = useWallet();
  const userId = publicKey?.toBase58() ?? null;
  const previousUserIdRef = useRef<string | null>(null);
  const { invalidateDashboardData, removeDashboardData } = useRefetchData();

  const handleWalletAccountChange = useCallback(
    (nextUserId: string | null) => {
      const previousUserId = previousUserIdRef.current;

      if (!nextUserId && previousUserId) {
        removeDashboardData();
      } else if (
        nextUserId &&
        previousUserId &&
        nextUserId !== previousUserId
      ) {
        invalidateDashboardData();
      }

      previousUserIdRef.current = nextUserId;
    },
    [invalidateDashboardData, removeDashboardData]
  );

  useEffect(() => {
    handleWalletAccountChange(userId);
  }, [userId, handleWalletAccountChange]);

  const {
    data: metrics,
    isLoading: isMetricsLoading,
    isFetching: isMetricsFetching,
    error: metricsQueryError,
    refetch: refetchMetrics,
  } = useMetrics({ userId, enabled: Boolean(userId) });

  const {
    data: tokenBalances,
    isLoading: isTokenBalancesLoading,
    isFetching: isTokenBalancesFetching,
    error: tokenBalancesQueryError,
    refetch: refetchTokenBalances,
  } = useTokenBalances({ userId, enabled: Boolean(userId) });
  const metricsData = metrics ?? null;
  const tokenBalancesData = tokenBalances ?? null;

  const [isManualRefresh, setIsManualRefresh] = useState(false);

  const metricsLoading = isMetricsLoading || isMetricsFetching;
  const tokenBalancesLoading =
    isTokenBalancesLoading || isTokenBalancesFetching;
  const metricsInitialLoad = metricsLoading && !metricsData;
  const metricsError =
    metricsQueryError instanceof Error
      ? metricsQueryError
      : metricsQueryError
      ? new Error(String(metricsQueryError))
      : null;

  const tokenBalancesError =
    tokenBalancesQueryError instanceof Error
      ? tokenBalancesQueryError
      : tokenBalancesQueryError
      ? new Error(String(tokenBalancesQueryError))
      : null;

  const combinedError = metricsError ?? tokenBalancesError ?? null;

  const isWalletRestoring = connecting || (connected && !userId);

  const shouldShowSkeleton =
    !combinedError &&
    (isWalletRestoring ||
      ((!metricsData || !tokenBalancesData) &&
        (metricsLoading || tokenBalancesLoading)));

  const handleRefresh = useCallback(async () => {
    if (isManualRefresh) {
      return;
    }

    setIsManualRefresh(true);

    try {
      await Promise.all([refetchMetrics(), refetchTokenBalances()]);
    } catch (error) {
      console.error("Failed to refresh dashboard data", error);
    } finally {
      setIsManualRefresh(false);
    }
  }, [isManualRefresh, refetchMetrics, refetchTokenBalances]);

  const isRefreshing =
    isManualRefresh || metricsLoading || tokenBalancesLoading;

  const portfolioValue = useMemo(() => {
    return normaliseWithDecimals(
      metricsData?.summary.totalPositionValue ?? 0,
      USDC_DECIMALS
    );
  }, [metricsData]);

  const baseAssetTokenBalance = useMemo(() => {
    if (!tokenBalancesData?.balances?.length) {
      return null;
    }

    const baseAssetCode = (() => {
      const asset = metricsData?.summary.baseAsset;
      return typeof asset === "string" && asset.trim().length > 0
        ? asset.toUpperCase()
        : "USDC";
    })();

    const matchingEntry = tokenBalancesData.balances.find((entry) => {
      const symbol = entry.tokenSymbol?.toUpperCase();
      const name = entry.tokenName?.toUpperCase();
      return (
        entry.tokenAddress === USDC_MINT_ADDRESS ||
        symbol === baseAssetCode ||
        name === baseAssetCode
      );
    });

    return matchingEntry ?? null;
  }, [metricsData, tokenBalancesData]);

  const availableBalance = baseAssetTokenBalance?.normalizedBalance ?? 0;

  const capitalBreakdown = useMemo<CapitalBreakdown>(() => {
    const baseAsset = (() => {
      const asset = metricsData?.summary.baseAsset;
      return typeof asset === "string" && asset.trim().length > 0
        ? asset.trim().toUpperCase()
        : "USDC";
    })();

    const decimals = baseAssetTokenBalance?.decimals ?? USDC_DECIMALS;
    const yieldBalance = baseAssetTokenBalance?.yieldBalance ?? null;

    const principal = yieldBalance
      ? normaliseWithDecimals(yieldBalance.funds, decimals)
      : portfolioValue;

    const earned = yieldBalance
      ? normaliseWithDecimals(yieldBalance.amountOfYield, decimals)
      : metricsData?.summary.totalYieldEarned ?? 0;

    const earningTotal = Math.max(principal + earned, 0);
    const heldBalance =
      baseAssetTokenBalance?.normalizedBalance ?? availableBalance;
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
  }, [metricsData, baseAssetTokenBalance, availableBalance, portfolioValue]);

  const lastUpdatedLabel = useMemo(() => {
    const iso = metricsData?.summary.lastUpdated;
    if (!iso) {
      return null;
    }

    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    const diffMs = Date.now() - parsed.getTime();

    if (diffMs < 60 * 1000) {
      return "updated just now";
    }

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 60) {
      return `updated ${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `updated ${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `Updated ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }, [metricsData]);

  return (
    <>
      <ErrorDisplay error={combinedError} />

      {!shouldShowSkeleton && (
        <div className="flex items-center justify-between gap-4">
          {lastUpdatedLabel ? (
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {lastUpdatedLabel}
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground hover:text-foreground"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh dashboard data"
          >
            {isRefreshing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="size-4" aria-hidden="true" />
            )}
            <span>Refresh</span>
          </Button>
        </div>
      )}

      {shouldShowSkeleton ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="flex h-full flex-col gap-6">
              <div className="grid gap-6 sm:auto-rows-[minmax(0,1fr)] sm:grid-cols-2">
                <APYCardSkeleton />
                <PortfolioValueCardSkeleton />
              </div>
              <div className="flex-1">
                <ManagePositionsCardSkeleton />
              </div>
            </div>

            <div className="flex h-full flex-col">
              <div className="flex-1">
                <StatsCardSkeleton />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="flex h-full flex-col gap-6">
              <div className="grid gap-6 sm:auto-rows-[minmax(0,1fr)] sm:grid-cols-2">
                <APYCard metrics={metricsData} isLoading={metricsInitialLoad} />
                <PortfolioValueCard
                  metrics={metricsData}
                  portfolioValue={portfolioValue}
                  availableBalance={availableBalance}
                />
              </div>
              <div className="flex-1">
                <div className="flex h-full flex-col gap-6">
                  <CapitalStatusCard breakdown={capitalBreakdown} />
                  <ManagePositionsCard
                    tokenBalances={tokenBalancesData?.balances ?? null}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col">
              <StatsCard
                metrics={metricsData}
                portfolioValue={portfolioValue}
                capitalBreakdown={capitalBreakdown}
                baseAssetBalance={baseAssetTokenBalance}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BreezeDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 pt-8 pb-14 max-w-6xl space-y-5">
        <Header />
        <AuthGuard>
          <DashboardContent />
        </AuthGuard>
      </div>
    </div>
  );
}
