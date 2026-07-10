"use client";

import { WalletProvider, useWallet } from "@/components/WalletProvider";
import { BalanceProvider } from "@/components/BalanceProvider";
import { ConnectButton } from "@/components/ConnectButton";
import { BalanceCard } from "@/components/BalanceCard";
import { SendPayment } from "@/components/SendPayment";

function Dashboard() {
  const { connected, installed, network, wrongNetwork } = useWallet();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-neutral-900 dark:text-neutral-50">
              Stellar Pay
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
              Testnet
            </span>
          </div>
        </div>
        <ConnectButton />
      </header>

      {/* Network mismatch banner */}
      {wrongNetwork && (
        <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Freighter is currently on <b>{network}</b>. This app runs on <b>Testnet</b> —
          switch networks in the Freighter extension to continue.
        </div>
      )}

      {/* Connected: the dApp */}
      {connected ? (
        <div className="mt-6 space-y-4">
          <BalanceCard />
          <SendPayment />
        </div>
      ) : (
        /* Disconnected: intro / call to action */
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            Send XLM on Stellar Testnet
          </h2>
          <p className="mt-2 max-w-md text-neutral-500">
            Connect your Freighter wallet to check your balance, get free Testnet
            XLM, and send a payment to any address.
          </p>
          <div className="mt-8">
            <ConnectButton />
          </div>
          {!installed && (
            <p className="mt-4 text-sm text-neutral-400">
              No wallet?{" "}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-500"
              >
                Install Freighter
              </a>
            </p>
          )}
        </div>
      )}

      <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-400 dark:border-neutral-800">
        Built on Stellar Testnet · Freighter · @stellar/stellar-sdk
      </footer>
    </main>
  );
}

export default function Home() {
  return (
    <WalletProvider>
      <BalanceProvider>
        <Dashboard />
      </BalanceProvider>
    </WalletProvider>
  );
}
