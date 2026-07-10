"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  isAllowed,
  getAddress,
  requestAccess,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";
import { config } from "@/lib/stellar";

export interface FreighterState {
  /** Freighter extension detected in the browser. */
  installed: boolean;
  /** App has an authorized address from the wallet. */
  connected: boolean;
  address: string | null;
  /** Network label reported by the wallet, e.g. "TESTNET". */
  network: string | null;
  /** True when the wallet is on a different network than this dApp expects. */
  wrongNetwork: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  sign: (xdr: string) => Promise<string>;
}

export function useFreighter(): FreighterState {
  const [installed, setInstalled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // On mount: detect the extension and silently restore a prior authorization.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { isConnected: detected } = await isConnected();
      if (cancelled) return;
      setInstalled(Boolean(detected));
      if (!detected) return;

      // Only pull the address if the user already granted this app access,
      // so we never trigger the Freighter popup on page load.
      const { isAllowed: allowed } = await isAllowed();
      if (cancelled || !allowed) return;

      const { address: addr } = await getAddress();
      if (cancelled || !addr) return;

      const { network: net } = await getNetwork();
      if (cancelled) return;

      setConnected(true);
      setAddress(addr);
      setNetwork(net ?? null);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const { isConnected: detected } = await isConnected();
      if (!detected) {
        setInstalled(false);
        throw new Error(
          "Freighter extension not found. Install it from freighter.app, then reload this page."
        );
      }
      setInstalled(true);

      const { address: addr, error } = await requestAccess();
      if (error) throw new Error(readError(error));
      if (!addr) throw new Error("No address returned — access was not granted.");

      const { network: net } = await getNetwork();

      setConnected(true);
      setAddress(addr);
      setNetwork(net ?? null);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // Freighter has no revoke API; we clear local session state so the UI
    // returns to the disconnected view. Re-connecting is one click.
    setConnected(false);
    setAddress(null);
    setNetwork(null);
  }, []);

  const sign = useCallback(
    async (xdr: string): Promise<string> => {
      if (!connected || !address) throw new Error("Wallet not connected.");
      const { signedTxXdr, error } = await signTransaction(xdr, {
        networkPassphrase: config.networkPassphrase,
        address,
      });
      if (error) throw new Error(readError(error));
      if (!signedTxXdr) throw new Error("Signing was cancelled.");
      return signedTxXdr;
    },
    [connected, address]
  );

  const wrongNetwork =
    connected && network !== null && network !== config.expectedWalletNetwork;

  return {
    installed,
    connected,
    address,
    network,
    wrongNetwork,
    connecting,
    connect,
    disconnect,
    sign,
  };
}

/** Freighter errors arrive as either a string or an object with `.message`. */
function readError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Wallet request failed or was rejected.";
}
