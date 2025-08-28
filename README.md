# HL Market 

## Overview
HL Market is a binary-event prediction market on Hyperliquid.  
It allows users to:

- Deposit/withdraw USDC into a vault and mint LP tokens.
- Take long/short positions on a single binary event (e.g., "ETH > $10K by EOY?").
- Receive or pay funding payments every 8 hours.
- Resolve event outcomes via a Chainlink oracle (manual stub for MVP).
- Track real-time metrics via Allium.

This project is intended as a **single-market prototype** for testing Hyperliquid API, smart contracts, and frontend integration.

---

## Project Structure

hl-market-app/
├── frontend/ # React + Vite + TypeScript + shadcn UI
│ ├── src/
│ ├── public/
│ ├── package.json
│ └── vite.config.ts
├── contracts/ # Foundry smart contracts
│ ├── src/
│ ├── test/
│ └── foundry.toml
└── README.md

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite, shadcn UI, Wagmi, Ethers.js, Allium SDK, Hyperliquid SDK
- **Blockchain:** Solidity, Hyperliquid L1, Foundry for contract dev/test/deploy
- **Contracts:** Vault (ERC20 LP token), PredictionPerp (perpetual market logic)
- **Oracle:** Chainlink (stub for MVP)
- **Data:** Allium (trades, orders, metrics)

---

## Getting Started

### Prerequisites

- Node.js v20+
- pnpm / npm / yarn
- Foundry (`forge`, `cast`)
- Metamask wallet for frontend

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Smart Contracts

```bash
cd contracts
forge install
forge build
forge test
```

### Usage Flow

1. Connect wallet via frontend.
2. Deposit USDC into Vault → mint LP tokens.
3. Open long/short position on the binary event.
4. Positions accrue funding payments every 8 hours.
5. After event resolution, positions are settled, and vault distributes gains/losses.
6. Track metrics and positions in real-time via Allium dashboard.

---

### Notes

- This is a **prototype MVP**: only a single market, no advanced hedging/rebalancing.
- Oracle resolution is manual/stubbed for MVP.
- Funding and bias logic is simplified.
