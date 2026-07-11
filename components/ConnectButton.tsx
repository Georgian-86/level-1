"use client";

import { useState } from "react";
import { useWallet } from "./WalletProvider";
import { CopyButton } from "./CopyButton";
import { shortAddress, explorerAccountUrl } from "@/lib/stellar";

export function ConnectButton({ size = "sm" }: { size?: "sm" | "lg" }) {
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
      <div className="flex items-center gap-2">
        <div className="surface flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
          <a
            href={explorerAccountUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-neutral-200 transition hover:text-white"
            title={address}
          >
            {shortAddress(address)}
          </a>
          <CopyButton value={address} label="Copy address" />
        </div>
        <button
          onClick={disconnect}
          className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm font-medium text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const sizing = size === "lg" ? "px-7 py-3 text-base" : "px-5 py-2 text-sm";

  return (
    <div className={`flex flex-col ${size === "lg" ? "items-center" : "items-end"} gap-2`}>
      <button
        onClick={handleConnect}
        disabled={connecting}
        className={`group relative inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:shadow-indigo-700/50 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 ${sizing}`}
      >
        {connecting ? (
          <>
            <Spinner /> Connecting…
          </>
        ) : (
          <>
            <WalletIcon /> Connect Freighter
          </>
        )}
      </button>
      {error && <p className="max-w-xs text-right text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function WalletIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" />
      <path d="M21 12H16a2 2 0 0 0 0 4h5a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
