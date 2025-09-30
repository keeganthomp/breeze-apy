import { useQuery } from "@tanstack/react-query";
import {
  type ApiErrorResponse,
  type MetricsSuccessResponse,
} from "@/types/api";
import { QUERY_KEYS } from "@/constants";

type UseMetricsParams = {
  userId: string;
  enabled?: boolean;
};

// Hook for fetching single-fund metrics data
export function useMetrics({ userId, enabled = true }: UseMetricsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.metrics,
    queryFn: async (): Promise<MetricsSuccessResponse> => {
      if (!userId) {
        throw new Error("Unable to load metrics: userId is required");
      }

      const endpoint = `/api/yield-metrics/${encodeURIComponent(userId)}`;

      const response = await fetch(endpoint);
      const payload: MetricsSuccessResponse | ApiErrorResponse =
        await response.json();

      if (!response.ok || !payload.success) {
        const errorMessage = payload.success
          ? "Unable to load metrics"
          : payload.error;
        throw new Error(errorMessage || "Unable to load metrics");
      }

      return payload;
    },
    enabled: enabled && !!userId,
  });
}
