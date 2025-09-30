"use client";
import { useMemo } from "react";
import { useMetrics } from "@/hooks";
import {
  Header,
  ErrorDisplay,
  ManagePositionsCard,
  APYCard,
  EarningsCard,
  StatsCard,
  Footer,
  ManagePositionsCardSkeleton,
  APYCardSkeleton,
  EarningsCardSkeleton,
  StatsCardSkeleton,
  AuthGuard,
} from "@/components/dashboard";
import { DEFAULT_FUND_LABEL } from "@/constans";
import { useWallet } from "@solana/wallet-adapter-react";

function DashboardContent() {
  const { publicKey } = useWallet();
  const userId = publicKey?.toString() ?? "";

  const {
    data: metrics,
    isLoading,
    isFetching,
    error,
  } = useMetrics({ userId, enabled: Boolean(userId) });

  const metricsData = metrics ?? null;
  const metricsLoading = isLoading || isFetching;
  const metricsError = error;

  const shouldShowSkeleton = metricsLoading && !metricsData && !metricsError;
  const fundLabel = useMemo(() => {
    const entries = metricsData?.raw?.userYield?.data;
    if (!Array.isArray(entries) || entries.length === 0) {
      return DEFAULT_FUND_LABEL;
    }

    const firstEntry = entries[0];
    if (
      typeof firstEntry?.fund_name === "string" &&
      firstEntry.fund_name.trim().length > 0
    ) {
      return firstEntry.fund_name;
    }

    if (
      typeof metricsData?.fundId === "string" &&
      metricsData.fundId.trim().length > 0
    ) {
      return metricsData.fundId;
    }

    return DEFAULT_FUND_LABEL;
  }, [metricsData]);

  return (
    <>
      <ErrorDisplay error={metricsError} />

      {shouldShowSkeleton ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <APYCardSkeleton />
                <EarningsCardSkeleton />
              </div>
              <ManagePositionsCardSkeleton />
            </div>

            <div className="space-y-6">
              <StatsCardSkeleton />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <APYCard metrics={metricsData} isLoading={metricsLoading} />
                <EarningsCard metrics={metricsData} />
              </div>
              <ManagePositionsCard metrics={metricsData} fundLabel={fundLabel} />
            </div>

            <div className="space-y-6">
              <StatsCard metrics={metricsData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function BreezyDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-5">
        <Header />

        <AuthGuard>
          <DashboardContent />
        </AuthGuard>

        <Footer />
      </div>
    </div>
  );
}
