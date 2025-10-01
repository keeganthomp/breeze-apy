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

export const toStringOrUndefined = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
};

export const toNumberOrUndefined = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

export const toNormalisedYield = (value: unknown, decimals: number): number => {
  const rawString =
    typeof value === "string"
      ? value
      : typeof value === "number"
      ? value.toString()
      : undefined;

  if (!rawString) {
    return 0;
  }

  const integerPart = rawString.split(".")[0] ?? "0";
  const parsed = Number.parseInt(integerPart, 10);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed / 10 ** decimals;
};

export const diffInDays = (from?: string, to?: string): number | undefined => {
  if (!from) {
    return undefined;
  }

  const start = Date.parse(from);
  const end = Date.parse(to ?? new Date().toISOString());

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return undefined;
  }

  const diffMs = Math.max(end - start, 0);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};
