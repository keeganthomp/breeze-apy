"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { type Wallet, useWallet } from "@solana/wallet-adapter-react";

import { slicePublicKey } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

const WalletOption = ({
  wallet,
  connected,
  connectedWallet,
  pendingWallet,
  connecting,
  onClick,
}: {
  wallet: Wallet;
  connected: boolean;
  connectedWallet: Wallet | null;
  pendingWallet: string | null;
  connecting: boolean;
  onClick: (wallet: Wallet) => void;
}) => {
  const { adapter, readyState } = wallet;
  const isActive = connected && connectedWallet?.adapter.name === adapter.name;
  const isPending = pendingWallet === adapter.name || connecting;
  const canConnect =
    readyState === WalletReadyState.Installed ||
    readyState === WalletReadyState.Loadable;

  return (
    <button
      type="button"
      onClick={isActive ? () => {} : () => onClick(wallet)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-left transition dark:border-slate-800/80 dark:bg-slate-900/80 ${
        isActive
          ? "cursor-default"
          : "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:hover:border-slate-700"
      }`}
    >
      <span className="flex items-center gap-3">
        {adapter.icon && (
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden bg-white dark:border-slate-700 dark:bg-slate-800">
            <Image
              src={adapter.icon}
              alt={adapter.name}
              width={32}
              height={32}
              className="size-8"
              unoptimized
            />
          </span>
        )}
        <span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
            {adapter.name}
          </span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            {canConnect
              ? isActive
                ? "Connected"
                : "Click to connect"
              : "Install to connect"}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
        {isPending
          ? "Connecting"
          : canConnect
          ? isActive
            ? "Active"
            : "Connect"
          : "Install"}
        {isActive && <span className="size-2 rounded-full bg-green-500" />}
      </span>
    </button>
  );
};

export function WalletConnectModal({ open, onClose }: WalletConnectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [pendingWallet, setPendingWallet] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    wallets,
    select,
    connect,
    disconnect,
    connected,
    connecting,
    wallet,
    publicKey,
  } = useWallet();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setPendingWallet(null);
      setErrorMessage(null);
      return;
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (
        modalRef.current &&
        event.target instanceof Node &&
        !modalRef.current.contains(event.target)
      ) {
        onClose();
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  const availableWallets = useMemo(
    () =>
      wallets.filter(
        (candidate) => candidate.readyState !== WalletReadyState.Unsupported
      ),
    [wallets]
  );

  const handleWalletClick = useCallback(
    async (targetWallet: Wallet) => {
      const { adapter, readyState } = targetWallet;
      setErrorMessage(null);

      if (readyState === WalletReadyState.NotDetected) {
        if (adapter.url) {
          window.open(adapter.url, "_blank", "noopener,noreferrer");
        }
        return;
      }

      try {
        setPendingWallet(adapter.name);
        select(adapter.name);
        await connect();
        onClose();
      } catch (error) {
        console.error("Failed to connect wallet", error);
        setErrorMessage(
          (error as Error)?.message ?? "Unable to connect. Please try again."
        );
      } finally {
        setPendingWallet(null);
      }
    },
    [connect, onClose, select]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      onClose();
    } catch (error) {
      console.error("Failed to disconnect wallet", error);
      setErrorMessage(
        (error as Error)?.message ?? "Unable to disconnect. Please try again."
      );
    }
  }, [disconnect, onClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/20 dark:bg-slate-900 dark:shadow-black/40"
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Connect Wallet
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Choose a Solana wallet to continue.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>

        {connected && wallet && (
          <div className="mb-6 rounded-2xl bg-slate-900/5 p-4 text-sm text-slate-700 dark:bg-slate-100/5 dark:text-slate-300">
            <p className="font-medium">Currently connected</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {wallet.adapter.name}
            </p>
            {publicKey && (
              <p className="mt-2 text-center break-all rounded-xl bg-white/60 px-3 py-2 font-mono text-xs text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-700">
                {slicePublicKey(publicKey.toBase58())}
              </p>
            )}
            <Button
              variant="ghost"
              className="mt-4 w-full justify-center text-sm font-medium text-slate-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-800"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {availableWallets.map((candidate) => (
            <WalletOption
              key={candidate.adapter.name}
              wallet={candidate}
              connected={connected}
              connectedWallet={wallet}
              pendingWallet={pendingWallet}
              connecting={connecting}
              onClick={handleWalletClick}
            />
          ))}
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {errorMessage}
          </p>
        )}
      </div>
    </div>,
    document.body
  );
}
