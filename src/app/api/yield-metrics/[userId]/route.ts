import { NextRequest, NextResponse } from "next/server";
import { BreezeApiError } from "@breezebaby/breeze-sdk";

import {
  getBreezeSdk,
  getDefaultBreezeContext,
  type UserYield,
} from "@/lib/breeze";
import {
  type MetricsErrorResponse,
  type MetricsSuccessResponse,
} from "@/types/api";
import { toNumber } from "@/lib/utils";
import { USDC_DECIMALS } from "@/constants";

type BreezeYieldData = UserYield["data"][number];

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId?: string } }
) {
  const { fund: defaultFund } = getDefaultBreezeContext();

  const userId = params.userId?.trim();
  const fundId = defaultFund.id;

  if (!userId || !fundId) {
    return NextResponse.json<MetricsErrorResponse>(
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

    const userYield = await sdk.getUserYield({ userId, fundId });

    const yieldEntries = userYield.data ?? [];

    // hack: take integer part and convert to proper decimal position
    const rawYieldEarnedString = yieldEntries[0]?.yield_earned?.toString();
    const integerPart = rawYieldEarnedString?.split(".")[0] ?? "0";
    const integerPartNumber = parseInt(integerPart);

    // Convert integer to proper decimal: 3 -> 0.000003, 30 -> 0.00003, etc.
    const totalYieldEarned = integerPartNumber / 10 ** USDC_DECIMALS;

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
        lastUpdated,
        baseAsset,
      },
      raw: {
        userYield,
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
