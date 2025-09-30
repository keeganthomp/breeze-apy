"use client";

import type { ReactNode } from "react";

import { useWallet } from "@solana/wallet-adapter-react";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center text-center pt-12 space-y-2">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Wallet Required
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please connect your wallet to begin earning.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
