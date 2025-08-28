# Hyperliquid Order App

A client-side React application built with Vite and TypeScript to interact with the Hyperliquid API for placing orders on the HyperEVM network, using Privy for secure wallet authentication.

## Overview
This app allows users to log in with a wallet (e.g., MetaMask), select a trading pair, and place limit orders on the Hyperliquid testnet or mainnet via the HyperEVM network. It leverages Privy for wallet management and the `@nktkas/hyperliquid` SDK for API integration.

## Features
- Wallet authentication with Privy (embedded or external wallets like MetaMask).
- Order placement for supported trading pairs (e.g., HYPE, BTC).
- Real-time feedback on order status.
- Configurable for HyperEVM testnet or mainnet.

## Prerequisites
- Node.js (v18+)
- MetaMask wallet
- Hyperliquid testnet/mainnet network added to MetaMask

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/hl-order-app.git
   cd hl-order-app
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   - Create a `.env` file in the root directory:
     ```
     VITE_PRIVY_APP_ID=your_privy_app_id
     ```
   - Obtain `VITE_PRIVY_APP_ID` from [Privy Dashboard](https://dashboard.privy.io).

4. **Set Up Networks in MetaMask**
   - **Testnet (Recommended for Development)**:
     - Network Name: HyperEVM Testnet
     - RPC URL: `https://rpc.hyperliquid-testnet.xyz/evm`
     - Chain ID: 998
     - Currency Symbol: HYPE
     - Block Explorer: `https://explorer.hyperliquid-testnet.xyz/evm`
   - **Mainnet**:
     - Network Name: HyperEVM
     - RPC URL: `https://rpc.hyperliquid.xyz/evm`
     - Chain ID: 999
     - Currency Symbol: HYPE
     - Block Explorer: `https://explorer.hyperliquid.xyz/evm`

## Configuration
- **HyperEVM Network**: Configured in `src/main.tsx` under `supportedChains`. Switch `id` to 998 (testnet) or 999 (mainnet) and update `rpcUrls` accordingly.
- **Privy Environment**: Set `VITE_PRIVY_APP_ID` in `.env`. Ensure `loginMethods` and `embeddedWallets` are adjusted in `main.tsx` based on wallet preferences.
- **Testnet Mode**: Set `isTestnet: true` in `src/lib/hyperliquid.ts` for testing.

## Usage
1. **Run the App**
   ```bash
   pnpm dev
   ```
2. **Log In**
   - Open the app in your browser, click "Log In", and connect MetaMask or use an embedded wallet via Privy.
3. **Place an Order**
   - Enter a valid trading pair (e.g., `HYPE`), quantity (e.g., 10), and limit price (e.g., 0.02).
   - Click "Place Order" or "Activate Account" if needed.
4. **Verify**
   - Check order status in the app and transactions on the Hyperliquid explorer.

## Dependencies
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Wallet**: `@privy-io/react-auth`
- **API**: `@nktkas/hyperliquid`, `ethers`
- **Dev Tools**: `@types/react`, `@vitejs/plugin-react`

## Troubleshooting
- **Invalid Pair**: Debug `meta.universe` in the console to list available pairs.
- **Account Activation**: Send 0.01 HYPE from the connected wallet to itself to activate the account.
- **Wallet Mismatch**: Ensure MetaMask is connected by updating `main.tsx` login methods; clear cache if addresses switch.

## Contributing
Fork the repository, create a feature branch, and submit a pull request.

## License
MIT

## Resources
- [Hyperliquid Docs](https://hyperliquid.gitbook.io/hyperliquid-docs)
- [Privy Docs](https://docs.privy.io)
- [Hyperliquid Explorer](https://explorer.hyperliquid-testnet.xyz/evm)
