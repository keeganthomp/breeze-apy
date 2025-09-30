import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeposit } from "@/hooks";
import { formatNumber } from "@/lib/utils";
import type { MetricsSuccessResponse } from "@/types/api";

interface DepositFormProps {
  metrics: MetricsSuccessResponse | null;
  baseAsset: string;
}

export function DepositForm({ metrics, baseAsset }: DepositFormProps) {
  const amountInputId = useId();
  const helperTextId = `${amountInputId}-helper`;
  const errorTextId = `${amountInputId}-error`;

  const [depositAmount, setDepositAmount] = useState("");
  const [hasBlurredAmount, setHasBlurredAmount] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const depositMutation = useDeposit();

  const availableBalanceEntry = useMemo(() => {
    if (!metrics?.balances?.length) return null;

    const normalisedBase = baseAsset.toUpperCase();

    return (
      metrics.balances.find((entry) => {
        const symbol = entry.tokenSymbol?.toUpperCase();
        const name = entry.tokenName?.toUpperCase();
        return symbol === normalisedBase || name === normalisedBase;
      }) ?? null
    );
  }, [metrics, baseAsset]);

  const availableBalance = availableBalanceEntry?.normalizedBalance ?? null;

  const parsedAmount = useMemo(() => {
    if (!depositAmount) return Number.NaN;
    const normalisedValue = depositAmount.replace(/,/g, "").trim();
    if (!normalisedValue || normalisedValue === ".") return Number.NaN;
    const amount = Number.parseFloat(normalisedValue);
    return Number.isFinite(amount) ? amount : Number.NaN;
  }, [depositAmount]);

  const amountIsPositive = Number.isFinite(parsedAmount) && parsedAmount > 0;
  const amountExceedsBalance =
    availableBalance !== null && amountIsPositive
      ? parsedAmount > availableBalance
      : false;

  const validationMessage = useMemo(() => {
    if (!depositAmount) return "";
    if (!amountIsPositive) {
      return "Enter a positive deposit amount";
    }

    if (amountExceedsBalance) {
      return `Amount exceeds available balance (${formatNumber(
        availableBalance ?? 0
      )} ${baseAsset})`;
    }

    return "";
  }, [
    depositAmount,
    amountIsPositive,
    amountExceedsBalance,
    availableBalance,
    baseAsset,
  ]);

  const shouldShowValidation = Boolean(
    validationMessage && (hasBlurredAmount || depositMutation.isError)
  );

  const helperMessage = useMemo(() => {
    if (availableBalance === null) {
      return "Enter the amount you want to deposit and confirm the transaction in your wallet.";
    }

    const tokenLabel =
      availableBalanceEntry?.tokenSymbol ??
      availableBalanceEntry?.tokenName ??
      baseAsset;

    return `Available: ${formatNumber(availableBalance)} ${tokenLabel}`;
  }, [availableBalance, availableBalanceEntry, baseAsset]);

  const describedBy =
    [
      helperMessage ? helperTextId : null,
      shouldShowValidation ? errorTextId : null,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || undefined;

  const handleCopyTransaction = useCallback(async () => {
    const transactionPayload = depositMutation.data?.transaction;
    if (!transactionPayload) return;

    if (!navigator?.clipboard?.writeText) {
      toast.error("Clipboard access is not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(transactionPayload);
      setHasCopied(true);
      toast.success("Transaction payload copied");
    } catch {
      toast.error("Failed to copy transaction payload");
    }
  }, [depositMutation.data?.transaction]);

  useEffect(() => {
    if (!hasCopied) {
      return;
    }

    const timeout = window.setTimeout(() => setHasCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [hasCopied]);

  const handleDeposit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setHasBlurredAmount(true);

      if (!amountIsPositive) {
        toast.error(`Enter a positive ${baseAsset} amount`);
        return;
      }

      if (amountExceedsBalance) {
        toast.error("Amount exceeds available balance");
        return;
      }

      try {
        const depositPromise = depositMutation.mutateAsync({
          amount: parsedAmount,
          fundId: metrics?.fundId,
        });

        await toast.promise(depositPromise, {
          loading: "Preparing your deposit…",
          success: () =>
            `Deposit transaction ready. Sign the request in your wallet to complete the deposit.`,
          error: (error: unknown) =>
            error instanceof Error ? error.message : "Deposit failed",
        });

        setDepositAmount("");
        setHasBlurredAmount(false);
        setHasCopied(false);
      } catch {
        // Error feedback is handled via the toast.promise rejection handler
      }
    },
    [
      amountExceedsBalance,
      amountIsPositive,
      baseAsset,
      depositMutation,
      metrics?.fundId,
      parsedAmount,
    ]
  );

  const isSubmitting = depositMutation.isPending;
  const isSubmitDisabled =
    isSubmitting || !amountIsPositive || amountExceedsBalance || !depositAmount;

  const transactionPayload = depositMutation.data?.transaction;

  return (
    <div className="space-y-4">
      <form className="space-y-3" onSubmit={handleDeposit} noValidate>
        <div className="space-y-2">
          <Label htmlFor={amountInputId} className="text-sm font-medium">
            Deposit Amount ({baseAsset})
          </Label>
          <div className="flex gap-2">
            <Input
              id={amountInputId}
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              onBlur={() => setHasBlurredAmount(true)}
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              enterKeyHint="done"
              autoComplete="off"
              placeholder="0.00"
              className="flex-1"
              aria-invalid={shouldShowValidation || undefined}
              aria-describedby={describedBy}
            />
            <Button
              type="submit"
              className="px-6 bg-accent-pink hover:bg-accent-pink/90 disabled:bg-accent-pink/80"
              disabled={isSubmitDisabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                "Deposit"
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {helperMessage && (
              <p id={helperTextId} className="text-xs text-muted-foreground">
                {helperMessage}
              </p>
            )}
          </div>
        </div>

        {(shouldShowValidation || depositMutation.error) && (
          <p id={errorTextId} role="alert" className="text-sm text-destructive">
            {validationMessage || depositMutation.error?.message}
          </p>
        )}
      </form>

      {transactionPayload && (
        <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-600 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            Transaction payload ready
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 border border-border/60 px-2"
              onClick={handleCopyTransaction}
            >
              {hasCopied ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {hasCopied ? "Copied" : "Copy"}
            </Button>
          </div>
          <code className="block max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
            {transactionPayload}
          </code>
        </div>
      )}
    </div>
  );
}
