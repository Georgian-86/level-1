import * as StellarSdk from "@stellar/stellar-sdk";
import { horizon, config } from "./stellar";

export interface PaymentResult {
  hash: string;
  ledger: number;
}

/**
 * Build an unsigned native XLM payment transaction and return its XDR.
 * The XDR is handed to the wallet (Freighter) for signing.
 */
export async function buildPaymentTx(
  source: string,
  destination: string,
  amount: string
): Promise<string> {
  // loadAccount also fetches the current sequence number for the source.
  const account = await horizon.loadAccount(source);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination,
        asset: StellarSdk.Asset.native(),
        amount,
      })
    )
    .setTimeout(180)
    .build();

  return tx.toXDR();
}

/**
 * Submit a signed transaction (XDR) to Horizon and return the hash + ledger.
 * Throws a human-readable Error on failure, decoding Horizon result codes.
 */
export async function submitPaymentTx(signedXdr: string): Promise<PaymentResult> {
  const tx = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase
  ) as StellarSdk.Transaction;

  try {
    const res = await horizon.submitTransaction(tx);
    return { hash: res.hash, ledger: res.ledger };
  } catch (error: unknown) {
    throw new Error(decodeHorizonError(error));
  }
}

/**
 * Turn a Horizon submission failure into a message a user can act on.
 * Horizon reports failures via extras.result_codes rather than the HTTP status.
 */
function decodeHorizonError(error: unknown): string {
  const codes = (
    error as {
      response?: {
        data?: {
          extras?: {
            result_codes?: { transaction?: string; operations?: string[] };
          };
        };
      };
    }
  )?.response?.data?.extras?.result_codes;

  const op = codes?.operations?.[0];
  const txCode = codes?.transaction;

  if (op === "op_underfunded") {
    return "Insufficient XLM balance to send that amount (remember ~1 XLM must stay for the account reserve).";
  }
  if (op === "op_no_destination") {
    return "The destination account does not exist yet. On Testnet, fund it first (the first payment must be at least 1 XLM to create it).";
  }
  if (op === "op_line_full" || op === "op_no_issuer") {
    return "The destination cannot receive this payment.";
  }
  if (txCode === "tx_insufficient_balance") {
    return "Insufficient balance to cover the amount plus network fee.";
  }
  if (txCode === "tx_bad_seq") {
    return "Transaction sequence error — please retry.";
  }
  if (txCode === "tx_too_late" || txCode === "tx_expired") {
    return "Transaction expired before submission — please try again.";
  }

  if (error instanceof Error) return error.message;
  return "Transaction failed. Please check the details and try again.";
}
