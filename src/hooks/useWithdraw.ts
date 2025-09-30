import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type TransactionErrorResponse,
  type TransactionSuccessResponse,
} from "@/types/api";
import { QUERY_KEYS } from "@/constans";

// Hook for withdraw mutation
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      fundId,
    }: {
      amount: number;
      fundId?: string;
    }): Promise<TransactionSuccessResponse> => {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, fundId }),
      });

      const payload: TransactionSuccessResponse | TransactionErrorResponse =
        await response.json();

      if (!response.ok || !payload.success) {
        const message = payload.success ? "Withdrawal failed" : payload.error;
        throw new Error(message || "Withdrawal failed");
      }

      return payload;
    },
    onSuccess: () => {
      // Invalidate and refetch metrics after successful withdrawal
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.metrics });
    },
  });
}
