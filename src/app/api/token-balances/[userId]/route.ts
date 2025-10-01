import { NextRequest, NextResponse } from "next/server";
import { BreezeApiError } from "@breezebaby/breeze-sdk";

import { getBreezeSdk, type UserBalances } from "@/lib/breeze";
import {
  type TokenBalanceEntry,
  type TokenBalancesErrorResponse,
  type TokenBalancesSuccessResponse,
} from "@/types/api";
import { normaliseWithDecimals, toNumber } from "@/lib/utils";
import { USDC_MINT_ADDRESS } from "@/constants";

type BreezeBalanceData = UserBalances["data"][number];
type BreezeYieldBalance = BreezeBalanceData["yield_balance"];

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId: rawUserId } = await context.params;
  const userId = rawUserId?.trim();

  if (!userId) {
    return NextResponse.json<TokenBalancesErrorResponse>(
      {
        success: false,
        error:
          "userId is required. Provide it in the route path or configure BREEZE_USER_ID.",
      },
      { status: 400 }
    );
  }

  try {
    const sdk = getBreezeSdk();

    const userBalancesUSDC = await sdk.getUserBalances({
      userId,
      asset: USDC_MINT_ADDRESS,
    });

    const mappedBalances = (
      [...(userBalancesUSDC.data ?? [])] as BreezeBalanceData[]
    ).map<TokenBalanceEntry>((entry) => {
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

    return NextResponse.json<TokenBalancesSuccessResponse>({
      success: true,
      userId,
      balances: mappedBalances,
      raw: {
        usdc: userBalancesUSDC,
      },
    });
  } catch (error) {
    if (error instanceof BreezeApiError) {
      return NextResponse.json<TokenBalancesErrorResponse>(
        {
          success: false,
          error: error.message,
          details: error.response,
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json<TokenBalancesErrorResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
