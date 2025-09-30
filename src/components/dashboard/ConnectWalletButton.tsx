"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";

import { WalletConnectModal } from "./WalletConnectModal";

export function ConnectWalletButton() {
  const { connected, connecting, publicKey, wallet } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  const label = useMemo(() => {
    if (connecting) {
      return "Connecting...";
    }

    if (connected && publicKey) {
      const base58 = publicKey.toBase58();
      return `${base58.slice(0, 4)}…${base58.slice(-4)}`;
    }

    return "Connect Wallet";
  }, [connected, connecting, publicKey]);

  return (
    <>
      <Button
        type="button"
        onClick={() => setModalOpen(true)}
        className="rounded-full bg-deep-purple px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-deep-purple/90 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-slate-900 dark:shadow-black/30 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-700 dark:focus-visible:ring-offset-slate-900"
      >
        {wallet?.adapter.icon && connected ? (
          <span className="mr-2 inline-flex size-5 items-center justify-center overflow-hidden rounded-full bg-white/10 dark:bg-black/10">
            <Image
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              width={20}
              height={20}
              className="size-5"
              unoptimized
            />
          </span>
        ) : null}
        {label}
      </Button>

      <WalletConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
