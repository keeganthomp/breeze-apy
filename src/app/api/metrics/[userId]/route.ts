import { NextRequest, NextResponse } from "next/server";
import { BreezeApiError } from "@breezebaby/breeze-sdk";

import {
  getBreezeSdk,
  getDefaultBreezeContext,
  type UserBalances,
  type UserYield,
} from "@/lib/breeze";
import {
  type MetricsBalanceEntry,
  type MetricsErrorResponse,
  type MetricsSuccessResponse,
} from "@/types/api";
import { toNumber, normaliseWithDecimals } from "@/lib/utils";
import { SOLANA_MINT_ADDRESS, USDC_MINT_ADDRESS } from "@/constans";

type BreezeYieldData = UserYield["data"][number];
type BreezeBalanceData = UserBalances["data"][number];
type BreezeYieldBalance = BreezeBalanceData["yield_balance"];

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId?: string } }
) {
  const { userId: defaultUserId, fundId: defaultFundId } = getDefaultBreezeContext();

  const userId = params.userId?.trim() || defaultUserId;
  const fundId = defaultFundId?.trim() || undefined;

  if (!userId) {
    return NextResponse.json<MetricsErrorResponse>(
      {
        success: false,
        error: "userId is required. Provide it in the route path or configure BREEZE_USER_ID.",
      },
      { status: 400 }
    );
  }

  try {
    const sdk = getBreezeSdk();

    const [userYield, userBalancesUSDC, userBalancesSOLANA] = await Promise.all([
      sdk.getUserYield({ userId, fundId }),
      sdk.getUserBalances({ userId, asset: USDC_MINT_ADDRESS }),
      sdk.getUserBalances({ userId, asset: SOLANA_MINT_ADDRESS }),
    ]);

    const yieldEntries = userYield.data ?? [];

    const balancesEntriesUSDC = userBalancesUSDC.data ?? [];
    const balancesEntriesSOLANA = userBalancesSOLANA.data ?? [];

    const totalYieldEarned = yieldEntries.reduce(
      (total, entry: BreezeYieldData) => {
        return total + toNumber(entry.yield_earned);
      },
      0
    );

    const totalPositionValue = yieldEntries.reduce(
      (total, entry: BreezeYieldData) => {
        return total + toNumber(entry.position_value);
      },
      0
    );

    const currentApy = yieldEntries.length
      ? toNumber(yieldEntries[0]?.apy)
      : undefined;
    const lastUpdated = yieldEntries.length
      ? typeof yieldEntries[0]?.last_updated === "string"
        ? yieldEntries[0]?.last_updated
        : undefined
      : undefined;
    const baseAsset =
      yieldEntries.length && typeof yieldEntries[0]?.base_asset === "string"
        ? yieldEntries[0]?.base_asset
        : undefined;

    const balances: MetricsBalanceEntry[] = [
      ...balancesEntriesUSDC,
      ...balancesEntriesSOLANA,
    ].map((entry) => {
      const decimals = toNumber(entry.decimals);
      const totalBalance = toNumber(entry.total_balance);
      const normalizedBalance = normaliseWithDecimals(totalBalance, decimals);

      const yieldBalanceRaw = entry.yield_balance as BreezeYieldBalance | null;
      const yieldBalance = yieldBalanceRaw
        ? {
            fundId:
              typeof yieldBalanceRaw.fund_id === "string"
                ? yieldBalanceRaw.fund_id
                : "",
            funds: toNumber(yieldBalanceRaw.funds),
            amountOfYield: toNumber(yieldBalanceRaw.amount_of_yield),
            fundApy: toNumber(yieldBalanceRaw.fund_apy),
          }
        : null;

      return {
        tokenAddress:
          typeof entry.token_address === "string" ? entry.token_address : "",
        tokenSymbol:
          typeof entry.token_symbol === "string" ? entry.token_symbol : "",
        tokenName: typeof entry.token_name === "string" ? entry.token_name : "",
        decimals,
        totalBalance,
        normalizedBalance,
        yieldBalance,
      };
    });

    const totalPortfolioValue = balances.reduce(
      (total, entry) => total + entry.normalizedBalance,
      0
    );

    const resolvedFundId =
      fundId ||
      (yieldEntries.length && typeof yieldEntries[0]?.fund_id === "string"
        ? yieldEntries[0]?.fund_id
        : undefined);

    return NextResponse.json<MetricsSuccessResponse>({
      success: true,
      userId,
      fundId: resolvedFundId,
      summary: {
        currentApy,
        totalYieldEarned,
        totalPositionValue,
        totalPortfolioValue,
        lastUpdated,
        baseAsset,
      },
      balances,
      raw: {
        userYield,
        userBalances: {
          ...userBalancesUSDC,
          ...userBalancesSOLANA,
        },
      },
    });
  } catch (error) {
    if (error instanceof BreezeApiError) {
      return NextResponse.json<MetricsErrorResponse>(
        {
          success: false,
          error: error.message,
          details: error.response,
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json<MetricsErrorResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

