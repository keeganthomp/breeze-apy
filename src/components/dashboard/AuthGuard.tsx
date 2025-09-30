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
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white/80 p-10 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:bg-slate-900/70 dark:shadow-black/40">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Wallet Required
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Please connect your wallet to continue.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
