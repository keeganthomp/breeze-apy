import { useQuery } from "@tanstack/react-query";

import {
  type ApiErrorResponse,
  type TokenBalancesSuccessResponse,
} from "@/types/api";
import { QUERY_KEYS } from "@/constants";

type UseTokenBalancesParams = {
  userId: string;
  enabled?: boolean;
};

export function useTokenBalances({
  userId,
  enabled = true,
}: UseTokenBalancesParams) {
  return useQuery({
    queryKey: QUERY_KEYS.tokenBalances,
    queryFn: async (): Promise<TokenBalancesSuccessResponse> => {
      if (!userId) {
        throw new Error("Unable to load token balances: userId is required");
      }

      const endpoint = `/api/token-balances/${encodeURIComponent(userId)}`;
      const response = await fetch(endpoint);
      const payload: TokenBalancesSuccessResponse | ApiErrorResponse =
        await response.json();

      if (!response.ok || !payload.success) {
        const errorMessage = payload.success
          ? "Unable to load token balances"
          : payload.error;
        throw new Error(errorMessage || "Unable to load token balances");
      }

      return {
        ...payload,
        balances: payload.balances,
      };
    },
    enabled: enabled && !!userId,
  });
}
