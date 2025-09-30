import { BreezeSDK } from "@breezebaby/breeze-sdk";

type BreezeSdkConfig = {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
};

let cachedSdk: BreezeSDK | null = null;

function resolveConfig(): BreezeSdkConfig {
  const apiKey = process.env.BREEZE_API_KEY;
  if (!apiKey) {
    throw new Error("BREEZE_API_KEY is not configured");
  }

  const baseUrl = process.env.BREEZE_BASE_URL;
  const timeoutEnv = process.env.BREEZE_API_TIMEOUT_MS;
  const timeout = timeoutEnv ? Number(timeoutEnv) : undefined;

  if (timeout !== undefined && Number.isNaN(timeout)) {
    throw new Error("BREEZE_API_TIMEOUT_MS must be a valid number if provided");
  }

  return {
    apiKey,
    baseUrl,
    timeout,
  };
}

export function getBreezeSdk(): BreezeSDK {
  if (cachedSdk) {
    return cachedSdk;
  }

  const config = resolveConfig();
  cachedSdk = new BreezeSDK({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    timeout: config.timeout,
  });

  return cachedSdk;
}

export type {
  UserBalances,
  UserYield,
  TransactionForDeposit,
  TransactionForWithdraw,
  InstructionsForDeposit,
  InstructionsForWithdraw,
} from "@breezebaby/breeze-sdk";

export function getDefaultBreezeContext() {
  const userId = process.env.BREEZE_USER_ID;
  const userKey = process.env.BREEZE_USER_KEY ?? userId;
  const fundId = process.env.BREEZE_FUND_ID;
  const payerKey = process.env.BREEZE_PAYER_KEY ?? userKey ?? undefined;

  return {
    userId,
    userKey,
    fundId,
    payerKey,
  } as const;
}
