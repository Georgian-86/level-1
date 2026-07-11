"use client";

import { useBalance } from "./BalanceProvider";

/** Split a balance into whole + fractional parts for typographic emphasis. */
function formatXlm(value: string): { whole: string; frac: string } {
  const n = Number(value);
  if (!Number.isFinite(n)) return { whole: value, frac: "" };
  const [whole, frac = "00"] = n
    .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 7 })
    .split(".");
  return { whole, frac };
}

export function BalanceCard() {
  const { xlm, funded, loading, funding, error, refresh, fund } = useBalance();
  const { whole, frac } = formatXlm(xlm ?? "0");

  return (
    <section className="surface animate-in relative overflow-hidden rounded-3xl p-6 shadow-2xl shadow-black/40">
      {/* accent glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Available Balance
          </p>
          <div className="mt-3 flex items-baseline gap-1.5">
            {loading && xlm === null ? (
              <span className="text-5xl font-semibold text-neutral-700">••••</span>
            ) : (
              <span className="text-5xl font-semibold tracking-tight text-white tabular-nums">
                {whole}
                <span className="text-neutral-500">.{frac}</span>
              </span>
            )}
            <span className="ml-1 rounded-md bg-white/5 px-2 py-1 text-sm font-semibold text-indigo-300">
              XLM
            </span>
          </div>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-full border border-white/10 p-2.5 text-neutral-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:opacity-50"
          title="Refresh balance"
          aria-label="Refresh balance"
        >
          <svg className={loading ? "animate-spin" : ""} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <polyline points="21 3 21 9 15 9" />
          </svg>
        </button>
      </div>

      {!funded && xlm !== null && (
        <div className="relative mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <p className="text-sm font-semibold text-amber-200">This account isn&apos;t funded yet</p>
          <p className="mt-0.5 text-sm text-amber-200/70">
            Grab free Testnet XLM from Friendbot to start sending payments.
          </p>
          <button
            onClick={fund}
            disabled={funding}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-400 disabled:opacity-60"
          >
            {funding ? "Funding…" : "Fund 10,000 XLM"}
          </button>
        </div>
      )}

      {error && <p className="relative mt-3 text-sm text-rose-400">{error}</p>}
    </section>
  );
}
