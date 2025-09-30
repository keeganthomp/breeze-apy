import type {
  InstructionsForDeposit,
  InstructionsForWithdraw,
  TransactionForDeposit,
  TransactionForWithdraw,
  UserBalances,
  UserYield,
} from "@/lib/breeze";

export type ApiErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

export type ApiSuccessResponse<T> = {
  success: true;
} & T;

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type TransactionRequestPayload = {
  amount: number | string;
  fundId?: string;
  userKey?: string;
  payerKey?: string;
  all?: boolean | string;
};

export type TransactionMetadata = {
  fundId: string;
  userKey: string;
  payerKey?: string;
  amount: number;
  all: boolean;
};

export type TransactionSuccessPayload = {
  transaction: string;
  metadata: TransactionMetadata;
};

export type TransactionSuccessResponse = ApiSuccessResponse<TransactionSuccessPayload>;
export type TransactionErrorResponse = ApiErrorResponse;

export type DepositRequestPayload = TransactionRequestPayload;
export type WithdrawRequestPayload = TransactionRequestPayload;

export type DepositSuccessResponse = TransactionSuccessResponse;
export type WithdrawSuccessResponse = TransactionSuccessResponse;

export type MetricsSummary = {
  currentApy?: number;
  totalYieldEarned: number;
  totalPositionValue: number;
  totalPortfolioValue: number;
  lastUpdated?: string;
  baseAsset?: string;
};

export type MetricsBalanceEntry = {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  decimals: number;
  totalBalance: number;
  normalizedBalance: number;
  yieldBalance: {
    fundId: string;
    funds: number;
    amountOfYield: number;
    fundApy: number;
  } | null;
};

export type MetricsSuccessPayload = {
  userId: string;
  fundId?: string;
  summary: MetricsSummary;
  balances: MetricsBalanceEntry[];
  raw: {
    userYield: UserYield;
    userBalances: UserBalances;
  };
};

export type MetricsSuccessResponse = ApiSuccessResponse<MetricsSuccessPayload>;
export type MetricsErrorResponse = ApiErrorResponse;

export type InstructionsResponse =
  | InstructionsForDeposit
  | InstructionsForWithdraw;

export type TransactionResponse =
  | TransactionForDeposit
  | TransactionForWithdraw;
