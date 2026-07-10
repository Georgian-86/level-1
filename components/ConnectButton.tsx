"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { shortAddress, explorerAccountUrl } from "@/lib/stellar";

export function ConnectButton() {
  const { connected, address, connecting, connect, disconnect } = useWallet();
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect.");
    }
  };

  if (connected && address) {
    return (
      <div className="flex items-center gap-3">
        <a
          href={explorerAccountUrl(address)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-emerald-50 px-3 py-1.5 font-mono text-sm text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900"
          title={address}
        >
          {shortAddress(address)}
        </a>
        <button
          onClick={disconnect}
          className="rounded-full px-4 py-1.5 text-sm font-medium text-neutral-600 ring-1 ring-neutral-300 transition hover:bg-neutral-100 dark:text-neutral-300 dark:ring-neutral-700 dark:hover:bg-neutral-800"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {connecting ? "Connecting…" : "Connect Freighter"}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-red-500">{error}</p>}
    </div>
  );
}
