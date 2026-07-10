"use client";

import { useState, FormEvent } from "react";
import { useWallet } from "./WalletProvider";
import { useBalance } from "./BalanceProvider";
import { buildPaymentTx, submitPaymentTx } from "@/lib/transactions";
import { isValidStellarAddress, explorerTxUrl, shortAddress } from "@/lib/stellar";

type Phase = "idle" | "building" | "signing" | "submitting" | "success" | "error";

const PHASE_LABEL: Record<Phase, string> = {
  idle: "",
  building: "Building transaction…",
  signing: "Waiting for signature in Freighter…",
  submitting: "Submitting to Testnet…",
  success: "",
  error: "",
};

export function SendPayment() {
  const { address, sign, wrongNetwork } = useWallet();
  const { refresh, funded } = useBalance();

  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
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
    setTxHash(null);
    setErrorMsg(null);

    const validationError = validate();
    if (validationError) {
      setPhase("error");
      setErrorMsg(validationError);
      return;
    }

    try {
      setPhase("building");
      const xdr = await buildPaymentTx(address!, destination.trim(), amount.trim());

      setPhase("signing");
      const signedXdr = await sign(xdr);

      setPhase("submitting");
      const result = await submitPaymentTx(signedXdr);

      setPhase("success");
      setTxHash(result.hash);
      setDestination("");
      setAmount("");
      // Reflect the new balance after the payment leaves the account.
      refresh();
    } catch (err) {
      setPhase("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const disabled = !address || wrongNetwork || !funded || busy;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
        Send XLM
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="destination" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Destination address
          </label>
          <input
            id="destination"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="G…"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-indigo-900"
          />
        </div>

        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Amount (XLM)
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="0.0000001"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={busy}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm tabular-nums text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-indigo-900"
          />
        </div>

        <button
          type="submit"
          disabled={disabled}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? PHASE_LABEL[phase] : "Send Payment"}
        </button>
      </form>

      {/* Guidance when the form is blocked */}
      {!busy && phase !== "success" && (
        <>
          {wrongNetwork && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              Your wallet is on the wrong network. Switch Freighter to <b>Testnet</b> to send.
            </p>
          )}
          {address && !wrongNetwork && !funded && (
            <p className="mt-3 text-sm text-neutral-500">
              Fund your account with Friendbot above before sending.
            </p>
          )}
        </>
      )}

      {/* Success feedback with transaction hash */}
      {phase === "success" && txHash && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-semibold">Payment sent!</span>
          </div>
          <p className="mt-2 text-xs text-emerald-700/80 dark:text-emerald-400/80">Transaction hash</p>
          <p className="mt-0.5 break-all font-mono text-xs text-emerald-900 dark:text-emerald-200">{txHash}</p>
          <a
            href={explorerTxUrl(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-300"
          >
            View on Stellar Expert ↗
          </a>
        </div>
      )}

      {/* Failure feedback */}
      {phase === "error" && errorMsg && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <span className="font-semibold">Transaction failed</span>
          </div>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{errorMsg}</p>
        </div>
      )}

      {destination.trim() && isValidStellarAddress(destination.trim()) && !busy && phase !== "success" && (
        <p className="mt-3 text-xs text-neutral-400">
          Sending to <span className="font-mono">{shortAddress(destination.trim())}</span>
        </p>
      )}
    </section>
  );
}
