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
import { USDC_DECIMALS } from "@/constants";

type BreezeYieldData = UserYield["data"][number];

// The types exported from the Breeze SDK do not match the types in the API response.
// This function is a workaround to get the property from the yield entry while maintaining type safety.
// ew
const getYieldProperty = (
  yieldEntry = {} as BreezeYieldData,
  property: keyof BreezeYieldData,
  requiredType = "string" as "string" | "number"
): string | number | undefined => {
  return typeof yieldEntry[property] === requiredType
    ? yieldEntry[property]
    : undefined;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { fund: defaultFund } = getDefaultBreezeContext();

  const { userId: rawUserId } = await context.params;
  const userId = rawUserId?.trim();
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
    // unsure if we always want the first entry - but this is what I see in the API response consistantly
    const yieldEntry = yieldEntries[0];

    const yieldEarned = getYieldProperty(yieldEntry, "yield_earned", "number");
    const totalPositionValue = getYieldProperty(
      yieldEntry,
      "position_value",
      "number"
    ) as number;
    const currentApy = getYieldProperty(yieldEntry, "apy", "number") as number;
    const lastUpdated = getYieldProperty(yieldEntry, "last_updated") as string;
    const baseAsset = getYieldProperty(yieldEntry, "base_asset") as string;
    // hack: take integer part and convert to proper decimal position
    const rawYieldEarnedString = yieldEarned?.toString();
    const integerPart = rawYieldEarnedString?.split(".")[0] ?? "0";
    const integerPartNumber = parseInt(integerPart);
    // Convert integer to proper decimal: 3 -> 0.000003, 30 -> 0.00003, etc.
    const totalYieldEarned = integerPartNumber / 10 ** USDC_DECIMALS;

    return NextResponse.json<MetricsSuccessResponse>({
      success: true,
      userId,
      fundId,
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
