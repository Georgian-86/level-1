"use client";

import { useBalance } from "./BalanceProvider";

/** Format a raw balance string to 7 decimals with thousands separators. */
function formatXlm(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return value;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function BalanceCard() {
  const { xlm, funded, loading, funding, error, refresh, fund } = useBalance();

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
            Wallet Balance
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {loading && xlm === null ? (
              <span className="text-4xl font-semibold text-neutral-300 dark:text-neutral-700">
                ····
              </span>
            ) : (
              <span className="text-4xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
                {xlm !== null ? formatXlm(xlm) : "0.00"}
              </span>
            )}
            <span className="text-lg font-medium text-neutral-400">XLM</span>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:opacity-50 dark:hover:bg-neutral-800"
          title="Refresh balance"
          aria-label="Refresh balance"
        >
          <svg
            className={loading ? "animate-spin" : ""}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>

      {!funded && xlm !== null && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          <p className="font-medium">This account isn&apos;t funded yet.</p>
          <p className="mt-0.5 text-amber-700/90 dark:text-amber-400/90">
            Get free Testnet XLM from Friendbot to start sending payments.
          </p>
          <button
            onClick={fund}
            disabled={funding}
            className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-60"
          >
            {funding ? "Funding…" : "Fund with Friendbot (10,000 XLM)"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </section>
  );
}
