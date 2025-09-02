# Hyperliquid Prediction Market Contracts (MVP)

This repository contains Solidity smart contracts for a single-market binary prediction perpetual futures (perp) MVP on Hyperliquid EVM Testnet.

## Contracts Overview

1. **CounterpartyVault.sol**
   - **Purpose**: Manages liquidity pool for LPs, handling USDC deposits/withdrawals, minting/burning LP tokens (VLP), applying bias fees (e.g., higher fees on longs if "yes" probability >60%), and settling trader PNL.
   - **Key Features**: Deposit/withdraw with proportional shares, 60/40 "no" bias via dynamic fees, rebalance placeholder.
   - **Dependencies**: OpenZeppelin (ERC20, Ownable, ReentrancyGuard, SafeERC20, IERC20).
   - **Deployment Params**: USDC address (testnet: `0xAb16Fd3CD7882734fF3A5755b80c724b96617c53`), owner address.

2. **PredictionPerp.sol**
   - **Purpose**: Manages a single binary event market (e.g., "ETH > $10K by EOY?"). Handles long/short positions, funding payments every 8 hours, oracle resolution, and PNL settlement against the vault.
   - **Key Features**: Market orders, simplified funding rate, resolution to 0/100 via oracle, AMM-like price adjustments.
   - **Dependencies**: OpenZeppelin (Ownable, ReentrancyGuard, SafeERC20, IERC20), Chainlink (AggregatorV3Interface), CounterpartyVault.
   - **Deployment Params**: Vault address, oracle address, resolution timestamp, owner address.

3. **MockOracle.sol**
   - **Purpose**: Mocks Chainlink oracle for MVP testing, allowing manual resolution (set 0 for "No", 100 for "Yes").
   - **Key Features**: Owner-settable answer (initial 50), simulates Chainlink `latestRoundData`, emits AnswerUpdated event.
   - **Dependencies**: Chainlink (AggregatorV3Interface).
   - **Deployment Params**: Initial answer (e.g., 50 for neutral).

4. **Deploy.s.sol**
   - **Purpose**: Foundry script to deploy contracts in order: MockOracle → CounterpartyVault → PredictionPerp → Link vault to perp via `setPerpMarket`.
   - **Dependencies**: Forge-std (Script, console).
   - **Usage**: `forge script script/Deploy.s.sol:Deploy --rpc-url $HYPEREVM_TESTNET_RPC --private-key $PRIVATE_KEY --broadcast`.

## Installation and Setup

### Prerequisites
- Foundry: Install via `curl -L https://foundry.paradigm.xyz | bash && foundryup`.
- Node.js/npm: For LayerZero big block toggle.
- Git, Linux/WSL (Windows), and a wallet with testnet USDC/HYPE (get from https://app.hyperliquid-testnet.xyz/faucet).

### Installation Steps
1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd hl-market-app/contracts