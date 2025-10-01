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
  ManagePositionsCardSkeleton,
  APYCardSkeleton,
  PortfolioValueCardSkeleton,
  StatsCardSkeleton,
  AuthGuard,
} from "@/components/dashboard";
import { useWallet } from "@solana/wallet-adapter-react";
import { USDC_DECIMALS, USDC_MINT_ADDRESS } from "@/constants";
import { normaliseWithDecimals } from "@/lib/utils";
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

  const availableBalance = useMemo(() => {
    if (!tokenBalancesData?.balances?.length) {
      return 0;
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

    return matchingEntry?.normalizedBalance ?? 0;
  }, [metricsData, tokenBalancesData]);

  return (
    <>
      <ErrorDisplay error={combinedError} />

      {!shouldShowSkeleton && (
        <div className="flex justify-end">
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
                <APYCard
                  metrics={metricsData}
                  isLoading={metricsInitialLoad}
                />
                <PortfolioValueCard
                  metrics={metricsData}
                  portfolioValue={portfolioValue}
                  availableBalance={availableBalance}
                />
              </div>
              <div className="flex-1">
                <ManagePositionsCard
                  tokenBalances={tokenBalancesData?.balances ?? null}
                  className="h-full"
                />
              </div>
            </div>

            <div className="flex h-full flex-col">
              <StatsCard
                metrics={metricsData}
                portfolioValue={portfolioValue}
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
