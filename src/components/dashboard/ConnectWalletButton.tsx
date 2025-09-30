"use client";

import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";

import { WalletConnectModal } from "./WalletConnectModal";

export function ConnectWalletButton() {
  const { connected, connecting, publicKey } = useWallet();
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
        className={
          connected && publicKey
            ? "rounded-full bg-transparent px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            : "rounded-full bg-bright-pink   px-5 py-2.5 text-sm text-white shadow-md shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-bright-pink/90 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-white dark:text-slate-900 dark:shadow-black/30 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-700 dark:focus-visible:ring-offset-slate-900"
        }
      >
        {connected && publicKey ? (
          <>
            <User className="size-4" />
            <span className="font-mono">{label}</span>
          </>
        ) : (
          label
        )}
      </Button>

      <WalletConnectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
