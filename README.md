# Stellar Pay — Testnet Payment dApp

A minimal, production-quality Stellar dApp for the **Level 1 · White Belt** challenge. Connect the [Freighter](https://www.freighter.app/) wallet, view your XLM balance, fund from the Testnet faucet, and send XLM to any address — all on the **Stellar Testnet**.

![Stellar Pay](https://img.shields.io/badge/network-Testnet-8b5cf6) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Stellar SDK](https://img.shields.io/badge/%40stellar%2Fstellar--sdk-16-blue)

## Features

- **Wallet connect / disconnect** via Freighter, with silent session restore (no popup on reload).
- **Live XLM balance** fetched from Horizon, with a manual refresh and auto-refresh after payments.
- **Friendbot faucet** — one click to fund an unfunded account with 10,000 Testnet XLM.
- **Send XLM** to any valid address, with staged feedback (build → sign → submit → confirmed).
- **Clear transaction feedback**: success state with the transaction hash + a Stellar Expert explorer link, or a decoded, human-readable failure message.
- **Guardrails**: address validation, self-send check, positive-amount check, wrong-network detection, and decoded Horizon error codes (`op_underfunded`, `op_no_destination`, etc.).

## Level 1 requirements → where they live

| Requirement | Implementation |
| --- | --- |
| Freighter wallet + Testnet | [`lib/stellar.ts`](lib/stellar.ts) (network config), [`hooks/useFreighter.ts`](hooks/useFreighter.ts) |
| Wallet connect | `connect()` in [`hooks/useFreighter.ts`](hooks/useFreighter.ts) → [`components/ConnectButton.tsx`](components/ConnectButton.tsx) |
| Wallet disconnect | `disconnect()` in [`hooks/useFreighter.ts`](hooks/useFreighter.ts) |
| Fetch XLM balance | [`lib/balance.ts`](lib/balance.ts) `getBalance()` |
| Display balance | [`components/BalanceCard.tsx`](components/BalanceCard.tsx) |
| Send XLM transaction | [`lib/transactions.ts`](lib/transactions.ts) `buildPaymentTx()` + `submitPaymentTx()` |
| Transaction feedback (hash / status) | [`components/SendPayment.tsx`](components/SendPayment.tsx) |
| Error handling | validation in `SendPayment`, Horizon error decoding in `transactions.ts`, wallet errors in `useFreighter` |

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [`@stellar/stellar-sdk`](https://github.com/stellar/js-stellar-sdk) — transaction building & Horizon submission
- [`@stellar/freighter-api`](https://github.com/stellar/freighter) — wallet connection & signing
- Tailwind CSS v4

## Getting started

**Prerequisites:** Node.js 20+ and the [Freighter browser extension](https://www.freighter.app/) set to **Testnet**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Try it

1. Click **Connect Freighter** and approve access. Make sure Freighter is on **Testnet**.
2. If the account is new, click **Fund with Friendbot** to receive 10,000 test XLM.
3. Enter any destination `G…` address and an amount, then **Send Payment**.
4. On success you'll see the transaction hash and a link to view it on Stellar Expert.

> Need a second Testnet address? Create another account in Freighter, or use the [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test).

## Architecture

```
app/
  layout.tsx          Root layout + metadata
  page.tsx            Composes providers + dashboard UI
components/
  WalletProvider.tsx  Shares one Freighter wallet instance app-wide (React context)
  BalanceProvider.tsx Shares balance state + refresh/fund actions
  ConnectButton.tsx   Connect / disconnect + connected address chip
  BalanceCard.tsx     Balance display, refresh, Friendbot faucet
  SendPayment.tsx     Payment form, validation, staged status, success/error feedback
hooks/
  useFreighter.ts     Wallet detection, connect, disconnect, sign
lib/
  stellar.ts          Network config, address validation, explorer links
  balance.ts          Balance fetch + Friendbot funding
  transactions.ts     Build + submit payment, decode Horizon errors
```

State is lifted into two small React contexts so the header, balance card, and send form all read the same wallet/balance without prop-drilling or duplicate `useFreighter` instances.

## Notes

- **Testnet only.** All XLM here is valueless test currency. Do not reuse Testnet keys on Mainnet.
- Freighter has no programmatic "revoke"; **Disconnect** clears the local session view, and reconnecting is one click.

## License

MIT
