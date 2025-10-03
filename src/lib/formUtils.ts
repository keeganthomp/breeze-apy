import BigNumber from "bignumber.js";

/**
 * Creates percentage-based quick fill options for forms
 */
export function createQuickFillHandler(
  balance: number,
  setAmount: (amount: string) => void,
  decimals: number = 6,
  onAmountChange?: () => void
) {
  return (percentage: number) => {
    if (!Number.isFinite(balance) || balance <= 0) return;

    // Use BigNumber for precise percentage calculation
    const balanceBN = new BigNumber(balance);
    const percentageBN = new BigNumber(percentage);
    const targetAmountBN = balanceBN.multipliedBy(percentageBN);

    if (targetAmountBN.isLessThanOrEqualTo(0)) return;

    // Use base asset decimal precision, then remove trailing zeros
    const formatted = targetAmountBN.dp(decimals).toString();
    setAmount(formatted);
    onAmountChange?.();
  };
}

/**
 * Creates aria-describedby string from array of possible IDs
 */
export function createAriaDescribedBy(
  ids: (string | null | undefined)[]
): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(" ") : undefined;
}

/**
 * Quick fill percentage options
 */
export const QUICK_FILL_PERCENTAGES = [0.25, 0.5, 0.75, 1] as const;

/**
 * Formats percentage for display (1 -> "Max", others -> "25%")
 */
export function formatQuickFillLabel(percentage: number): string {
  if (percentage === 1) return "Max";

  const percentageBN = new BigNumber(percentage);
  const displayPercent = percentageBN
    .multipliedBy(100)
    .integerValue()
    .toString();
  return `${displayPercent}%`;
}
