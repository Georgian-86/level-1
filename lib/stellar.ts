import * as StellarSdk from "@stellar/stellar-sdk";

/**
 * Central Stellar configuration. This dApp targets Stellar **Testnet** only
 * (Level 1 requirement). All network-specific values live here so the rest of
 * the app never hardcodes URLs or passphrases.
 */
export const NETWORK = "testnet" as const;

export const config = {
  horizonUrl: "https://horizon-testnet.stellar.org",
  networkPassphrase: StellarSdk.Networks.TESTNET,
  friendbotUrl: "https://friendbot.stellar.org",
} as const;

/** Single shared Horizon server instance for the whole app. */
export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);

/** Truncate a public key for display, e.g. GABC…WXYZ */
export function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

/** Validate a Stellar account (ed25519) public key without throwing. */
export function isValidStellarAddress(address: string): boolean {
  return StellarSdk.StrKey.isValidEd25519PublicKey(address.trim());
}

/** Link to a transaction on the public Stellar testnet explorer. */
export function explorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

/** Link to an account on the public Stellar testnet explorer. */
export function explorerAccountUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`;
}
