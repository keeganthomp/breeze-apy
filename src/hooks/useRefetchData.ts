import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/constants";

type InvalidateOptions = {
  delay?: number;
};

export function useRefetchData() {
  const queryClient = useQueryClient();

  const invalidateDashboardData = useCallback(
    ({ delay }: InvalidateOptions = {}) => {
      const execute = () => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.metrics.all,
          exact: false,
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.tokenBalances.all,
          exact: false,
          refetchType: "active",
        });
      };

      execute();

      if (delay && delay > 0) {
        const schedule =
          typeof window !== "undefined" && typeof window.setTimeout === "function"
            ? window.setTimeout
            : setTimeout;

        schedule(execute, delay);
      }
    },
    [queryClient]
  );

  const removeDashboardData = useCallback(() => {
    queryClient.removeQueries({
      queryKey: QUERY_KEYS.metrics.all,
      exact: false,
    });
    queryClient.removeQueries({
      queryKey: QUERY_KEYS.tokenBalances.all,
      exact: false,
    });
  }, [queryClient]);

  const refetchDashboardData = useCallback(async () => {
    await Promise.all([
      queryClient.refetchQueries({
        queryKey: QUERY_KEYS.metrics.all,
        exact: false,
      }),
      queryClient.refetchQueries({
        queryKey: QUERY_KEYS.tokenBalances.all,
        exact: false,
      }),
    ]);
  }, [queryClient]);

  return {
    invalidateDashboardData,
    removeDashboardData,
    refetchDashboardData,
  };
}
