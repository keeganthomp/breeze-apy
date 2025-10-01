import { useCallback, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNumber, prepareTransaction, toAtomicUnits } from "@/lib/utils";
import { useRefetchData, useWithdraw } from "@/hooks";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAmountValidation } from "@/hooks/useAmountValidation";
import { useModalManager } from "@/hooks/useModalManager";
import {
  createQuickFillHandler,
  QUICK_FILL_PERCENTAGES,
  formatQuickFillLabel,
  createAriaDescribedBy,
} from "@/lib/formUtils";

import { USDC_DECIMALS } from "@/constants";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseAsset: string;
  fundId?: string | null;
  availableBalance: number;
}

export function WithdrawModal({
  isOpen,
  onClose,
  baseAsset,
  fundId,
  availableBalance,
}: WithdrawModalProps) {
  const amountInputId = useId();
  const helperTextId = `${amountInputId}-helper`;
  const errorTextId = `${amountInputId}-error`;

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const withdrawMutation = useWithdraw();
  const { reset } = withdrawMutation;
  const { invalidateDashboardData } = useRefetchData();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [hasBlurredAmount, setHasBlurredAmount] = useState(false);

  const handleRequestClose = useCallback(() => {
    setWithdrawAmount("");
    setHasBlurredAmount(false);
    reset();
    onClose();
  }, [onClose, reset]);

  const { inputRef } = useModalManager({
    isOpen,
    onClose: handleRequestClose,
  });

  const validation = useAmountValidation({
    amount: withdrawAmount,
    availableBalance,
    baseAsset,
    actionType: "withdraw",
  });

  const hasAvailableBalance =
    Number.isFinite(availableBalance) && availableBalance > 0;

  const shouldShowValidation = Boolean(
    validation.validationMessage && (hasBlurredAmount || withdrawMutation.error)
  );

  const isSubmitDisabled = !fundId || !validation.isValid;

  const helperMessage = hasAvailableBalance
    ? `Available to withdraw: ${formatNumber(availableBalance)} ${baseAsset}`
    : `Enter the amount you want to withdraw in ${baseAsset}.`;

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setHasBlurredAmount(true);

      if (!fundId || !validation.isValid) {
        if (validation.exceedsBalance) {
          toast.error("Amount exceeds available balance");
        }
        return;
      }

      // Close the modal while we run the asynchronous workflow
      handleRequestClose();

      toast.promise(
        (async () => {
          const atomicAmount = toAtomicUnits(
            validation.parsedAmount,
            USDC_DECIMALS
          );

          const { transaction } = await withdrawMutation.mutateAsync({
            amount: atomicAmount,
            fundId,
            userId: publicKey?.toBase58() ?? "",
          });
          const preparedTransaction = prepareTransaction(transaction);
          await sendTransaction(preparedTransaction, connection);

          invalidateDashboardData({ delay: 500 });
        })(),
        {
          loading: "Please confirm the withdrawal transaction",
          success: "Withdrawal successful!",
          error: (submissionError: unknown) =>
            submissionError instanceof Error
              ? submissionError.message
              : "Withdrawal failed",
        }
      );
    },
    [
      fundId,
      validation,
      withdrawMutation,
      publicKey,
      connection,
      sendTransaction,
      handleRequestClose,
      invalidateDashboardData,
    ]
  );

  const handleQuickFill = createQuickFillHandler(
    availableBalance,
    setWithdrawAmount,
    () => setHasBlurredAmount(false)
  );

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${amountInputId}-title`}
      onClick={handleRequestClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border/60 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id={`${amountInputId}-title`}
              className="text-lg font-semibold text-deep-purple"
            >
              Withdraw funds
            </h2>
            <p className="text-sm text-muted-foreground">
              Prepare a withdrawal transaction. You&apos;ll sign and submit it
              in your wallet.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={handleRequestClose}
          >
            <X className="size-5" aria-hidden />
            <span className="sr-only">Close withdraw modal</span>
          </Button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label
              htmlFor={amountInputId}
              className="text-sm font-medium text-deep-purple"
            >
              Withdraw Amount ({baseAsset})
            </Label>
            <Input
              id={amountInputId}
              ref={inputRef}
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              onBlur={() => setHasBlurredAmount(true)}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              aria-invalid={
                shouldShowValidation ||
                Boolean(withdrawMutation.error) ||
                undefined
              }
              aria-describedby={createAriaDescribedBy([
                helperTextId,
                shouldShowValidation ? errorTextId : null,
              ])}
            />
            <div className="flex flex-wrap gap-2">
              {QUICK_FILL_PERCENTAGES.map((percentage) => (
                <Button
                  key={percentage}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill(percentage)}
                  disabled={!hasAvailableBalance}
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  {formatQuickFillLabel(percentage)}
                </Button>
              ))}
            </div>
            <p id={helperTextId} className="text-xs text-muted-foreground">
              {helperMessage}
            </p>
            {shouldShowValidation && (
              <p id={errorTextId} className="text-xs text-destructive">
                {validation.validationMessage}
              </p>
            )}
            {withdrawMutation.error && !validation.validationMessage && (
              <p className="text-xs text-destructive">
                {withdrawMutation.error instanceof Error
                  ? withdrawMutation.error.message
                  : "Withdrawal failed"}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-bright-pink text-white hover:bg-bright-pink/90"
              disabled={isSubmitDisabled}
            >
              Withdraw
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
