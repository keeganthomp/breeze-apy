import { useMutation } from "@tanstack/react-query";
import {
  type TransactionErrorResponse,
  type TransactionSuccessResponse,
} from "@/types/api";

// Hook for withdraw txn mutation
export function useWithdraw() {
  return useMutation({
    mutationFn: async ({
      amount,
      fundId,
      userId,
    }: {
      amount: number;
      fundId?: string;
      userId: string;
    }): Promise<TransactionSuccessResponse> => {
      const response = await fetch("/api/withdraw/txn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, fundId, userId }),
      });

      const payload: TransactionSuccessResponse | TransactionErrorResponse =
        await response.json();

      if (!response.ok || !payload.success) {
        const message = payload.success ? "Withdrawal failed" : payload.error;
        throw new Error(message || "Withdrawal failed");
      }

      return payload;
    },
  });
}
