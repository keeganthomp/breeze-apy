import { NextRequest, NextResponse } from "next/server";
import { BreezeApiError } from "@breezebaby/breeze-sdk";

import { getBreezeSdk, getDefaultBreezeContext } from "@/lib/breeze";
import {
  TransactionErrorResponse,
  TransactionRequestPayload,
  WithdrawSuccessResponse,
} from "@/types/api";

export async function POST(request: NextRequest) {
  let body: TransactionRequestPayload;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json<TransactionErrorResponse>(
      {
        success: false,
        error: "Invalid JSON payload",
        details: error instanceof Error ? error.message : undefined,
      },
      { status: 400 }
    );
  }

  const amountValue =
    typeof body.amount === "string"
      ? Number.parseFloat(body.amount)
      : body.amount;

  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    return NextResponse.json<TransactionErrorResponse>(
      {
        success: false,
        error: "Withdrawal amount must be a positive number",
      },
      { status: 400 }
    );
  }

  const { fund: defaultFund } = getDefaultBreezeContext();

  const fundId = defaultFund.id;
  const userKey = body.userId?.trim();
  const payerKey = userKey;

  const allFlag =
    typeof body.all === "string" ? body.all === "true" : Boolean(body.all);

  if (!fundId) {
    return NextResponse.json<TransactionErrorResponse>(
      {
        success: false,
        error:
          "fundId is required. Provide it in the request body or configure BREEZE_FUND_ID.",
      },
      { status: 400 }
    );
  }

  if (!userKey) {
    return NextResponse.json<TransactionErrorResponse>(
      {
        success: false,
        error:
          "userKey is required. Provide it in the request body or configure BREEZE_USER_KEY/BREEZE_USER_ID.",
      },
      { status: 400 }
    );
  }

  try {
    const sdk = getBreezeSdk();
    const transaction = await sdk.createWithdrawTransaction({
      fundId,
      userKey,
      amount: amountValue,
      all: allFlag,
      payerKey: payerKey,
    });

    if (typeof transaction !== "string") {
      return NextResponse.json<TransactionErrorResponse>(
        {
          success: false,
          error: transaction?.message || "Unexpected response from Breeze API",
          details: transaction,
        },
        { status: 502 }
      );
    }

    return NextResponse.json<WithdrawSuccessResponse>({
      success: true,
      transaction,
      metadata: {
        fundId,
        userKey,
        payerKey,
        amount: amountValue,
        all: allFlag,
      },
    });
  } catch (error) {
    if (error instanceof BreezeApiError) {
      return NextResponse.json<TransactionErrorResponse>(
        {
          success: false,
          error: error.message,
          details: error.response,
        },
        { status: error.status || 502 }
      );
    }

    return NextResponse.json<TransactionErrorResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
