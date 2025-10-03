import { VersionedTransaction } from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import BigNumber from "bignumber.js";

/**
 * Combines Tailwind CSS class names with proper deduplication and conflict resolution
 * Used for conditional styling and merging component classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts unknown values to numbers with fallback to 0
 * Handles strings, numbers, and invalid values gracefully
 */
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

/**
 * Converts atomic units (blockchain integers) to human-readable decimals
 * Example: 1000000 atomic USDC units → 1.0 USDC (with 6 decimals)
 * Used when receiving data from APIs/blockchain
 */
export function normaliseWithDecimals(
  amount: number,
  decimals: number
): number {
  if (!Number.isFinite(amount) || !Number.isFinite(decimals)) {
    return 0;
  }

  const amountBN = new BigNumber(amount);
  const factor = new BigNumber(10).pow(decimals);

  if (factor.isZero()) {
    return amount;
  }

  const result = amountBN.div(factor);

  // Exact division - no rounding, just precise conversion
  return result.toNumber();
}

/**
 * Formats numbers for display with locale-specific formatting (commas, decimals)
 * Example: 1234.567 → "1,234.57" (with decimals=2)
 * Used for showing monetary values to users
 */
export function formatNumber(value: number, decimals = 2) {
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
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats numbers as percentage strings with 2 decimal places
 * Example: 45.67 → "45.67%", undefined → "-"
 * Used for displaying APY, allocation percentages, etc.
 */
export function formatPercent(value?: number) {
  if (value === undefined || Number.isNaN(value)) {
    return "-";
  }

  return `${value.toFixed(2)}%`;
}

/**
 * Truncates public keys/addresses for display (shows first 4 and last 4 characters)
 * Example: "1A2B3C4D5E6F7G8H" → "1A2B...7G8H"
 * Used for showing wallet addresses in UI without taking up space
 */
export const slicePublicKey = (publicKey?: string) => {
  if (!publicKey) {
    return "";
  }

  return (
    publicKey.toString().slice(0, 4) + "..." + publicKey.toString().slice(-4)
  );
};

/**
 * Converts human-readable decimals to atomic units (blockchain integers)
 * Example: 1.5 USDC → 1500000 atomic units (with 6 decimals)
 * Used when sending data to APIs/blockchain (opposite of normaliseWithDecimals)
 */
export function toAtomicUnits(value: number, decimals: number): number {
  // Use BigNumber for precise arithmetic to avoid floating-point errors
  const valueBN = new BigNumber(value);
  const factor = new BigNumber(10).pow(decimals);
  return valueBN.multipliedBy(factor).integerValue().toNumber();
}

/**
 * Deserializes base64-encoded transaction data for Solana blockchain
 * Converts API transaction strings into VersionedTransaction objects for wallet signing
 */
export const prepareTransaction = (txn: string) => {
  const transactionBuffer = Buffer.from(txn, "base64");
  const transaction = VersionedTransaction.deserialize(transactionBuffer);
  return transaction;
};

/**
 * Safely converts unknown values to strings, returns undefined for empty/invalid values
 * Used for optional string fields where empty strings should be treated as undefined
 */
export const toStringOrUndefined = (value: unknown): string | undefined => {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
};

/**
 * Safely converts unknown values to numbers, returns undefined for invalid values
 * Used for optional numeric fields where invalid values should be treated as undefined
 */
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

/**
 * Special parsing for yield values from API - extracts integer part and converts to decimals
 * Handles specific API format where yield might come as strings with decimals
 * Used for processing yield amounts from backend responses
 */
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

  // Use BigNumber for precise division
  const parsedBN = new BigNumber(parsed);
  const factor = new BigNumber(10).pow(decimals);
  return parsedBN.div(factor).toNumber();
};

/**
 * Calculates the difference between two dates in days
 * If 'to' is not provided, uses current date
 * Used for calculating how long user has been earning in the fund
 */
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
