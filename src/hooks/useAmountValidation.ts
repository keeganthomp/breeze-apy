import { useMemo } from "react";
import { formatNumber } from "@/lib/utils";

interface UseAmountValidationParams {
  amount: string;
  availableBalance?: number | null;
  baseAsset: string;
  actionType: "deposit" | "withdraw";
  checkBalance?: boolean;
}

export function useAmountValidation({
  amount,
  availableBalance = null,
  baseAsset,
  actionType,
  checkBalance = true,
}: UseAmountValidationParams) {
  const parsedAmount = useMemo(() => {
    if (!amount) return Number.NaN;
    const normalized = amount.replace(/,/g, "").trim();
    if (!normalized || normalized === ".") return Number.NaN;
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }, [amount]);

  const isPositive = Number.isFinite(parsedAmount) && parsedAmount > 0;

  const exceedsBalance = useMemo(() => {
    if (!checkBalance || availableBalance === null || !isPositive) return false;
    return parsedAmount > availableBalance;
  }, [checkBalance, availableBalance, isPositive, parsedAmount]);

  const validationMessage = useMemo(() => {
    if (!amount) return "";

    if (!isPositive) {
      return `Enter a positive ${actionType} amount`;
    }

    if (checkBalance && exceedsBalance && availableBalance !== null) {
      return `Amount exceeds available balance (${formatNumber(
        availableBalance
      )} ${baseAsset})`;
    }

    return "";
  }, [
    amount,
    isPositive,
    exceedsBalance,
    availableBalance,
    baseAsset,
    actionType,
    checkBalance,
  ]);

  return {
    parsedAmount,
    isValid: isPositive && !exceedsBalance,
    isPositive,
    exceedsBalance,
    validationMessage,
  };
}
