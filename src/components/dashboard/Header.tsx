import { ConnectWalletButton } from "./ConnectWalletButton";

export function Header() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl font-bold text-deep-purple dark:text-slate-100 pb-1">
          Breeze
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Simple. Smart. Earning.
        </p>
      </div>
      <div className="flex justify-center sm:justify-end">
        <ConnectWalletButton />
      </div>
    </header>
  );
}
