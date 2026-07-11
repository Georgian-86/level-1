"use client";

import { useState, FormEvent } from "react";
import { useWallet } from "./WalletProvider";
import { useBalance } from "./BalanceProvider";
import { CopyButton } from "./CopyButton";
import { buildPaymentTx, submitPaymentTx } from "@/lib/transactions";
import { isValidStellarAddress, explorerTxUrl, shortAddress } from "@/lib/stellar";

type Phase = "idle" | "building" | "signing" | "submitting" | "success" | "error";

const BUSY_LABEL: Partial<Record<Phase, string>> = {
  building: "Building transaction…",
  signing: "Confirm in Freighter…",
  submitting: "Submitting to Testnet…",
};

interface SentTx {
  amount: string;
  to: string;
  hash: string;
}

export function SendPayment() {
  const { address, sign, wrongNetwork } = useWallet();
  const { refresh, funded, xlm } = useBalance();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [sent, setSent] = useState<SentTx | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const busy = phase === "building" || phase === "signing" || phase === "submitting";

  const validate = (): string | null => {
    if (!address) return "Connect your wallet first.";
    const dest = destination.trim();
    if (!dest) return "Enter a destination address.";
    if (!isValidStellarAddress(dest)) return "That doesn't look like a valid Stellar address (should start with G).";
    if (dest === address) return "You can't send a payment to yourself.";
    const amt = Number(amount);
    if (!amount || !Number.isFinite(amt) || amt <= 0) return "Enter an amount greater than 0.";
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validationError = validate();
    if (validationError) {
      setPhase("error");
      setErrorMsg(validationError);
      return;
    }

    const to = destination.trim();
    const amt = amount.trim();

    try {
      setPhase("building");
      const xdr = await buildPaymentTx(address!, to, amt);

      setPhase("signing");
      const signedXdr = await sign(xdr);

      setPhase("submitting");
      const result = await submitPaymentTx(signedXdr);

      setSent({ amount: amt, to, hash: result.hash });
      setPhase("success");
      setDestination("");
      setAmount("");
      refresh();
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const backToHome = () => {
    setPhase("idle");
    setSent(null);
    setErrorMsg(null);
  };

  const pasteDestination = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setDestination(text.trim());
    } catch {
      /* clipboard unavailable */
    }
  };

  const setMax = () => {
    const bal = Number(xlm ?? "0");
    // Leave ~1 XLM base reserve + a little for fees.
    const max = Math.max(0, bal - 1.5);
    if (max > 0) setAmount(String(Number(max.toFixed(7))));
  };

  // ---- Success screen (replaces the form; offers "Back to Home") -----------
  if (phase === "success" && sent) {
    return (
      <section className="surface animate-in rounded-3xl p-8 text-center shadow-2xl shadow-black/40">
        <div className="animate-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-bold text-white">Payment Successful</h2>
        <p className="mt-1 text-sm text-neutral-400">
          You sent{" "}
          <span className="font-semibold text-white">{sent.amount} XLM</span> to{" "}
          <span className="font-mono text-neutral-200">{shortAddress(sent.to)}</span>
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Transaction Hash
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="min-w-0 flex-1 break-all font-mono text-xs text-neutral-200">{sent.hash}</p>
            <CopyButton value={sent.hash} label="Copy hash" className="shrink-0" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={backToHome}
            className="order-2 flex-1 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110 sm:order-1"
          >
            Back to Home
          </button>
          <a
            href={explorerTxUrl(sent.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="order-1 flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/5 sm:order-2"
          >
            View on Explorer ↗
          </a>
        </div>
      </section>
    );
  }

  // ---- Send form -----------------------------------------------------------
  const disabled = !address || wrongNetwork || !funded || busy;

  return (
    <section className="surface animate-in rounded-3xl p-6 shadow-2xl shadow-black/40">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-300">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-300">
          Send Payment
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="destination" className="text-sm font-medium text-neutral-300">
              Destination address
            </label>
            <button
              type="button"
              onClick={pasteDestination}
              disabled={busy}
              className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300 disabled:opacity-50"
            >
              Paste
            </button>
          </div>
          <input
            id="destination"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="G…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={busy}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 font-mono text-sm text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="amount" className="text-sm font-medium text-neutral-300">
              Amount
            </label>
            {funded && (
              <button
                type="button"
                onClick={setMax}
                disabled={busy}
                className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300 disabled:opacity-50"
              >
                Max
              </button>
            )}
          </div>
          <div className="relative">
            <input
              id="amount"
              type="number"
              min="0"
              step="0.0000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={busy}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-3 pr-16 text-sm tabular-nums text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
              XLM
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:from-neutral-700 disabled:to-neutral-700 disabled:opacity-60 disabled:shadow-none"
        >
          {busy ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              {BUSY_LABEL[phase]}
            </>
          ) : (
            "Send Payment"
          )}
        </button>
      </form>

      {/* Guidance when blocked */}
      {!busy && (
        <>
          {wrongNetwork && (
            <p className="mt-3 text-sm text-amber-400">
              Your wallet is on the wrong network. Switch Freighter to <b>Testnet</b> to send.
            </p>
          )}
          {address && !wrongNetwork && !funded && (
            <p className="mt-3 text-sm text-neutral-400">
              Fund your account with Friendbot above before sending.
            </p>
          )}
        </>
      )}

      {/* Failure feedback */}
      {phase === "error" && errorMsg && (
        <div className="animate-in mt-4 flex items-start gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] p-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-rose-400">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-rose-300">Transaction failed</p>
            <p className="mt-0.5 text-sm text-rose-200/80">{errorMsg}</p>
          </div>
        </div>
      )}
    </section>
  );
}
