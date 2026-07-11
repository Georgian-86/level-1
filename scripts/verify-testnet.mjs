// Throwaway end-to-end check of the payment logic against LIVE Stellar Testnet.
// Mirrors lib/transactions.ts (createAccount for new destinations, payment for
// existing ones) but signs with a local keypair instead of Freighter.
import * as StellarSdk from "@stellar/stellar-sdk";

const HORIZON = "https://horizon-testnet.stellar.org";
const FRIENDBOT = "https://friendbot.stellar.org";
const PASSPHRASE = StellarSdk.Networks.TESTNET;
const horizon = new StellarSdk.Horizon.Server(HORIZON);

async function accountExists(addr) {
  try {
    await horizon.loadAccount(addr);
    return true;
  } catch (e) {
    if (e?.response?.status === 404) return false;
    throw e;
  }
}

async function sendXlm(sourceKp, destination, amount) {
  const account = await horizon.loadAccount(sourceKp.publicKey());
  const exists = await accountExists(destination);
  const op = exists
    ? StellarSdk.Operation.payment({ destination, asset: StellarSdk.Asset.native(), amount })
    : StellarSdk.Operation.createAccount({ destination, startingBalance: amount });
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(180)
    .build();
  tx.sign(sourceKp); // Freighter does this step in the app
  const res = await horizon.submitTransaction(tx);
  return { op: exists ? "payment" : "createAccount", hash: res.hash, ledger: res.ledger };
}

const A = StellarSdk.Keypair.random(); // sender
const B = StellarSdk.Keypair.random(); // brand-new recipient

console.log("Sender  A:", A.publicKey());
console.log("Recip.  B:", B.publicKey());

console.log("\n1) Funding A via Friendbot…");
const fb = await fetch(`${FRIENDBOT}/?addr=${A.publicKey()}`);
console.log("   friendbot:", fb.status, fb.ok ? "OK" : "FAIL");

console.log("\n2) A -> B for 5 XLM (B does not exist yet)…");
const r1 = await sendXlm(A, B.publicKey(), "5");
console.log(`   used ${r1.op}, hash ${r1.hash} (ledger ${r1.ledger})`);

console.log("\n3) A -> B for 2 XLM (B now exists)…");
const r2 = await sendXlm(A, B.publicKey(), "2");
console.log(`   used ${r2.op}, hash ${r2.hash} (ledger ${r2.ledger})`);

const finalB = await horizon.loadAccount(B.publicKey());
const bal = finalB.balances.find((x) => x.asset_type === "native")?.balance;
console.log(`\n✓ B final balance: ${bal} XLM (expected 7.0000000)`);
console.log("✓ Both transaction paths confirmed on live Testnet.");
