import { useMutation } from "@tanstack/react-query";
import {
  type TransactionErrorResponse,
  type TransactionSuccessResponse,
} from "@/types/api";

// Hook for deposit txn mutation
export function useDeposit() {
  return useMutation({
    mutationFn: async ({
      amount,
      fundId,
      userId,
    }: {
      amount: number;
      userId: string;
      fundId?: string;
    }): Promise<TransactionSuccessResponse> => {
      const response = await fetch("/api/deposit/txn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, fundId, userId }),
      });

      const payload: TransactionSuccessResponse | TransactionErrorResponse =
        await response.json();

      if (!response.ok || !payload.success) {
        const message = payload.success ? "Deposit failed" : payload.error;
        throw new Error(message || "Deposit failed");
      }

      return payload;
    },
  });
}
