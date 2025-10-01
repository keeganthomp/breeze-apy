# Breeze APY Dashboard

A Next.js yield dashboard that allows anyone to connect their Solana wallet, deposit and withdrawal USDC to earn yield, and view their yield metrics.

## Prerequisites
- Node.js 18.17+ (shipped npm is fine)
- A Solana wallet extension (Phantom, Backpack, etc.)

## Environment
Duplicate `.env.example` to `.env` and populate the variables:

| Variable | Required | Description |
| --- | --- | --- |
| `BREEZE_API_KEY` | ✅ | Breeze API key used for authenticated SDK calls. |
| `NEXT_PUBLIC_USDC_FUND_ID` | ✅ | Fund identifier from the Breeze dashboard, exposed to the client. |
| `BREEZE_BASE_URL` | ❌ | Override the Breeze API base URL (defaults to the SDK's production endpoint). |
| `BREEZE_API_TIMEOUT_MS` | ❌ | Request timeout override in milliseconds. |

## Install
```bash
npm install
```

## Run Locally
```bash
npm run dev
```
The app serves on http://localhost:3000. Connect your wallet via the modal to load personalized portfolio data.

## Useful Commands
- `npm run lint` — static analysis via ESLint
- `npm run build` — production build (uses Next.js Turbopack)
- `npm run start` — run the compiled app locally

## Project Notes
- React Query caches portfolio metrics and token balances; use the in-app refresh control or rerun queries by refreshing the page.
- UI components are built with Tailwind CSS utilities, Shadcdn components, and Lucide icons.
- Deposits and withdrawals trigger an immediate refetch so dashboard metrics update as soon as your transaction is signed.
