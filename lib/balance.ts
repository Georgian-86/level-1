import { horizon, config } from "./stellar";

export interface BalanceResult {
  /** Native XLM balance as a string, e.g. "10000.0000000" */
  xlm: string;
  /** True when the account exists on-chain (has been funded at least once). */
  funded: boolean;
}

/**
 * Fetch the native XLM balance for an account.
 *
 * On Stellar an account does not exist on-chain until it is funded, and Horizon
 * returns 404 for an unfunded account. We treat that as a zero balance rather
 * than an error so the UI can prompt the user to fund via Friendbot.
 */
export async function getBalance(address: string): Promise<BalanceResult> {
  try {
    const account = await horizon.loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");
    return { xlm: native?.balance ?? "0", funded: true };
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return { xlm: "0", funded: false };
    }
    throw error;
  }
}

/**
 * Fund an account on Testnet using Friendbot (grants 10,000 test XLM).
 * Only available on Testnet — this whole dApp is Testnet-only.
 */
export async function fundWithFriendbot(address: string): Promise<void> {
  const res = await fetch(`${config.friendbotUrl}/?addr=${encodeURIComponent(address)}`);
  if (!res.ok) {
    // Friendbot returns 400 if the account is already funded.
    const body = await res.text().catch(() => "");
    if (res.status === 400 && body.includes("op_already_exists")) return;
    throw new Error("Friendbot funding failed. The account may already be funded, or try again shortly.");
  }
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 404
  );
}
