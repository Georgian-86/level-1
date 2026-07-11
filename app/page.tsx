"use client";

import { WalletProvider, useWallet } from "@/components/WalletProvider";
import { BalanceProvider } from "@/components/BalanceProvider";
import { ConnectButton } from "@/components/ConnectButton";
import { BalanceCard } from "@/components/BalanceCard";
import { SendPayment } from "@/components/SendPayment";

function Logo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
          <Logo className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight text-white">Stellar Pay</h1>
          <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-300">
            Testnet
          </span>
        </div>
      </div>
      <ConnectButton />
    </header>
  );
}

function Dashboard() {
  const { connected, installed, network, wrongNetwork } = useWallet();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-4 py-8 sm:py-12">
      <Header />

      {wrongNetwork && (
        <div className="animate-in mt-6 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] px-4 py-3.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-amber-400">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p className="text-sm text-amber-200/90">
            Freighter is on <b className="text-amber-100">{network}</b>. This app runs on{" "}
            <b className="text-amber-100">Testnet</b> — switch networks in the Freighter extension,
            then reload.
          </p>
        </div>
      )}

      {connected ? (
        <div className="mt-6 space-y-4">
          <BalanceCard />
          <SendPayment />
        </div>
      ) : (
        <Landing installed={installed} />
      )}

      <footer className="mt-auto pt-12 text-center text-xs text-neutral-600">
        Built on Stellar Testnet · Freighter · @stellar/stellar-sdk
      </footer>
    </main>
  );
}

function Landing({ installed }: { installed: boolean }) {
  const features = [
    { title: "Connect", desc: "Link your Freighter wallet" },
    { title: "Fund", desc: "Free Testnet XLM in one click" },
    { title: "Send", desc: "Pay any address instantly" },
  ];

  return (
    <div className="animate-in mt-14 flex flex-col items-center text-center sm:mt-20">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-2xl shadow-indigo-900/50">
        <Logo className="h-9 w-9" />
      </div>

      <h2 className="mt-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Send XLM on Stellar
      </h2>
      <p className="mt-3 max-w-md text-neutral-400">
        A simple, secure payment dApp on the Stellar Testnet. Connect your wallet to check your
        balance and send XLM to anyone.
      </p>

      <div className="mt-10">
        <ConnectButton size="lg" />
      </div>

      {!installed && (
        <p className="mt-4 text-sm text-neutral-500">
          Don&apos;t have a wallet?{" "}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-indigo-400 underline-offset-2 hover:underline"
          >
            Install Freighter
          </a>
        </p>
      )}

      <div className="mt-14 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {features.map((f, i) => (
          <div key={f.title} className="surface rounded-2xl p-4 text-left">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 text-xs font-bold text-indigo-300">
              {i + 1}
            </div>
            <p className="mt-3 text-sm font-semibold text-white">{f.title}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
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
