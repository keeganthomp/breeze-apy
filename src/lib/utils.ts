import { VersionedTransaction } from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function normaliseWithDecimals(
  amount: number,
  decimals: number
): number {
  if (!Number.isFinite(amount) || !Number.isFinite(decimals)) {
    return 0;
  }

  const factor = 10 ** decimals;
  return factor ? amount / factor : amount;
}

export function formatNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0.00";
  }

  // Handle very large numbers that might be in scientific notation
  if (Math.abs(value) >= 1e21) {
    // Convert to string with fixed notation to avoid scientific notation
    const str = value.toFixed(2);
    // Parse back to number to use toLocaleString
    const num = parseFloat(str);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(2)}%`;
}

export const slicePublicKey = (publicKey?: string) => {
  if (!publicKey) {
    return "";
  }

  return (
    publicKey.toString().slice(0, 4) + "..." + publicKey.toString().slice(-4)
  );
};

export function toAtomicUnits(value: number, decimals: number) {
  return value * 10 ** decimals;
}

export const prepareTransaction = (txn: string) => {
  const transactionBuffer = Buffer.from(txn, "base64");
  const transaction = VersionedTransaction.deserialize(transactionBuffer);
  return transaction;
};
