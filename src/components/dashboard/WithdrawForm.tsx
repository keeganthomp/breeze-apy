import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWithdraw } from "@/hooks";
import type { MetricsSuccessResponse } from "@/types/api";

interface WithdrawFormProps {
  metrics: MetricsSuccessResponse | null;
  baseAsset: string;
}

export function WithdrawForm({ metrics, baseAsset }: WithdrawFormProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const withdrawMutation = useWithdraw();

  const handleWithdraw = () => {
    if (!withdrawAmount || withdrawMutation.isPending) {
      return;
    }

    const amount = Number.parseFloat(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    withdrawMutation.mutate(
      { amount, fundId: metrics?.fundId },
      {
        onSuccess: () => {
          setWithdrawAmount("");
        },
      }
    );
  };

  const hasValidationError =
    !Number.isFinite(Number.parseFloat(withdrawAmount)) && withdrawAmount;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="withdraw" className="text-sm font-medium">
          Withdraw Amount ({baseAsset})
        </Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="withdraw"
            type="number"
            placeholder="0.00"
            value={withdrawAmount}
            onChange={(event) => setWithdrawAmount(event.target.value)}
            className="flex-1"
            min="0"
            step="0.01"
            inputMode="decimal"
          />
          <Button
            onClick={handleWithdraw}
            variant="outline"
            className="px-6"
            disabled={withdrawMutation.isPending}
          >
            {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
          </Button>
        </div>
        {withdrawMutation.error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            {withdrawMutation.error.message}
          </p>
        )}
        {hasValidationError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-300">
            Enter a positive withdrawal amount
          </p>
        )}
        {withdrawMutation.data && (
          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            Withdrawal transaction payload:
            <div className="mt-1 break-all">
              {withdrawMutation.data.transaction}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
