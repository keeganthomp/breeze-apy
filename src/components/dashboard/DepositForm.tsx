import { useCallback, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeposit, useRefetchData } from "@/hooks";
import { toAtomicUnits, prepareTransaction } from "@/lib/utils";
import type { TokenBalanceEntry } from "@/types/api";
import { USDC_DECIMALS } from "@/constants";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useAmountValidation } from "@/hooks/useAmountValidation";
import { createAriaDescribedBy } from "@/lib/formUtils";

interface DepositFormProps {
  baseAsset: string;
  balances: TokenBalanceEntry[] | null;
}

export function DepositForm({ baseAsset }: DepositFormProps) {
  const amountInputId = useId();
  const errorTextId = `${amountInputId}-error`;

  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const depositMutation = useDeposit();
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { invalidateDashboardData } = useRefetchData();

  const validation = useAmountValidation({
    amount: depositAmount,
    baseAsset,
    actionType: "deposit",
    checkBalance: false, // Don't check balance for deposits
  });

  const shouldShowValidation = Boolean(
    validation.validationMessage && depositMutation.isError
  );

  const handleDeposit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validation.isValid) {
        if (!validation.isPositive) {
          toast.error(`Enter a positive ${baseAsset} amount`);
        }
        return;
      }

      toast.promise(
        (async () => {
          try {
            setIsDepositing(true);
            const decimals = USDC_DECIMALS;
            const atomicAmount = toAtomicUnits(
              validation.parsedAmount,
              decimals
            );

            const { transaction } = await depositMutation.mutateAsync({
              amount: atomicAmount,
              userId: publicKey?.toBase58() ?? "",
            });

            const preparedTransaction = prepareTransaction(transaction);
            await sendTransaction(preparedTransaction, connection);

            setDepositAmount("");

            invalidateDashboardData({ delay: 500 });
          } finally {
            setIsDepositing(false);
          }
        })(),
        {
          loading: "Please confirm the deposit transaction",
          success: "Deposit successful!",
          error: (error: unknown) =>
            error instanceof Error ? error.message : "Deposit failed",
        }
      );
    },
    [
      validation,
      baseAsset,
      depositMutation,
      publicKey,
      connection,
      sendTransaction,
      invalidateDashboardData,
    ]
  );

  const isDisabled = isDepositing || !validation.isValid || !depositAmount;

  return (
    <div className="space-y-4">
      <form className="space-y-3" onSubmit={handleDeposit} noValidate>
        <div className="space-y-2">
          <Label htmlFor={amountInputId} className="text-sm font-medium">
            Deposit {baseAsset}
          </Label>
          <div className="flex gap-2 items-center">
            <Input
              id={amountInputId}
              value={depositAmount}
              disabled={isDepositing}
              onChange={(event) => setDepositAmount(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              placeholder="0.00"
              className="flex-1 bg-white py-6 px-3 text-lg"
              aria-invalid={shouldShowValidation || undefined}
              aria-describedby={createAriaDescribedBy([
                shouldShowValidation ? errorTextId : null,
              ])}
            />
            <Button
              type="submit"
              className="px-6 bg-accent-pink hover:bg-accent-pink/90 disabled:bg-accent-pink/80 h-12"
              disabled={isDisabled}
            >
              {isDepositing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                "Deposit"
              )}
            </Button>
          </div>
        </div>

        {(shouldShowValidation || depositMutation.error) && (
          <p id={errorTextId} role="alert" className="text-sm text-destructive">
            {validation.validationMessage || depositMutation.error?.message}
          </p>
        )}
      </form>
    </div>
  );
}
