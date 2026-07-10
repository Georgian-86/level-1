"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useWallet } from "./WalletProvider";
import { getBalance, fundWithFriendbot } from "@/lib/balance";

interface BalanceState {
  xlm: string | null;
  funded: boolean;
  loading: boolean;
  funding: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fund: () => Promise<void>;
}

const BalanceContext = createContext<BalanceState | null>(null);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { address, connected } = useWallet();
  const [xlm, setXlm] = useState<string | null>(null);
  const [funded, setFunded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [funding, setFunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getBalance(address);
      setXlm(result.xlm);
      setFunded(result.funded);
    } catch {
      setError("Could not fetch balance. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  const fund = useCallback(async () => {
    if (!address) return;
    setFunding(true);
    setError(null);
    try {
      await fundWithFriendbot(address);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Funding failed.");
    } finally {
      setFunding(false);
    }
  }, [address, refresh]);

  // Fetch whenever a wallet connects (or the address changes); clear on disconnect.
  useEffect(() => {
    if (connected && address) {
      refresh();
    } else {
      setXlm(null);
      setFunded(false);
      setError(null);
    }
  }, [connected, address, refresh]);

  return (
    <BalanceContext.Provider
      value={{ xlm, funded, loading, funding, error, refresh, fund }}
    >
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance(): BalanceState {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error("useBalance must be used within <BalanceProvider>");
  return ctx;
}
