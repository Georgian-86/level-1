"use client";

import { createContext, useContext, ReactNode } from "react";
import { useFreighter, FreighterState } from "@/hooks/useFreighter";

const WalletContext = createContext<FreighterState | null>(null);

/**
 * Provides a single shared Freighter wallet instance to the whole app, so the
 * header, balance card, and payment form all read the same connection state.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useFreighter();
  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
}

export function useWallet(): FreighterState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}
