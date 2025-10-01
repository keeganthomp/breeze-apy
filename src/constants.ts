import { Fund } from "./types/fund";

export const QUERY_KEYS = {
  metrics: {
    all: ["metrics"] as const,
    byUser: (userId: string) => ["metrics", userId] as const,
  },
  tokenBalances: {
    all: ["token-balances"] as const,
    byUser: (userId: string) => ["token-balances", userId] as const,
  },
};

export const USDC_MINT_ADDRESS = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const USDC_FUND: Fund = {
  id: process.env.NEXT_PUBLIC_USDC_FUND_ID!, // from Breeze dashboard
  name: "USDC Fund",
  baseAssetMint: USDC_MINT_ADDRESS,
  baseAsset: "USDC",
};

export const SOLANA_RPC_CLUSTER = "mainnet-beta";

export const USDC_DECIMALS = 6;
