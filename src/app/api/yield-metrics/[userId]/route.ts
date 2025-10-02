import { NextRequest, NextResponse } from "next/server";
import { BreezeApiError } from "@breezebaby/breeze-sdk";

import { getBreezeSdk, getDefaultBreezeContext } from "@/lib/breeze";
import {
  type MetricsErrorResponse,
  type MetricsSuccessResponse,
} from "@/types/api";
import {
  toNumberOrUndefined,
  toStringOrUndefined,
  toNormalisedYield,
  diffInDays,
} from "@/lib/utils";
import { USDC_FUND } from "@/constants";

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

    const userYield = await sdk.getUserYield({
      userId,
      fundId,
      limit: 14,
    });

    const yieldEntries = userYield.data ?? [];
    const fundMetrics = yieldEntries.find((entry) => entry.fund_id === fundId);

    const totalPositionValue =
      toNumberOrUndefined(fundMetrics?.position_value) ?? 0;
    const currentApy = toNumberOrUndefined(fundMetrics?.apy) ?? 0;
    const lastUpdated = toStringOrUndefined(fundMetrics?.last_updated);
    const fundName = toStringOrUndefined(fundMetrics?.fund_name);
    const entryDate = toStringOrUndefined(fundMetrics?.entry_date);
    const totalYieldEarned = toNormalisedYield(
      fundMetrics?.yield_earned,
      USDC_FUND.baseAsset.decimals
    );
    const daysInFund = diffInDays(entryDate, new Date().toISOString());

    const history = yieldEntries
      .map((entry) => {
        const timestamp = toStringOrUndefined(entry.last_updated);
        const pointEntryDate = toStringOrUndefined(entry.entry_date);
        const apy = toNumberOrUndefined(entry.apy);
        const positionValue = toNumberOrUndefined(entry.position_value);

        if (!timestamp && !pointEntryDate) {
          return null;
        }

        return {
          timestamp: timestamp ?? pointEntryDate!,
          apy: apy ?? 0,
          positionValue: positionValue ?? 0,
          yieldEarned: toNormalisedYield(
            entry.yield_earned,
            USDC_FUND.baseAsset.decimals
          ),
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((a, b) => {
        const timeA = Date.parse(a.timestamp);
        const timeB = Date.parse(b.timestamp);

        const safeA = Number.isFinite(timeA) ? timeA : 0;
        const safeB = Number.isFinite(timeB) ? timeB : 0;

        return safeA - safeB;
      });

    return NextResponse.json<MetricsSuccessResponse>({
      success: true,
      userId,
      fundId,
      summary: {
        currentApy,
        totalYieldEarned,
        totalPositionValue,
        lastUpdated,
        baseAsset: USDC_FUND.baseAsset,
        fundName,
        entryDate,
        daysInFund,
      },
      history,
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
