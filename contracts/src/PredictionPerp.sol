// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; // Added for safeTransfer/safeTransferFrom
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Added for IERC20 (consistency with vault)
import "./CounterpartyVault.sol";
// import "@chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/interfaces/AggregatorV3Interface.sol";


contract PredictionPerp is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    CounterpartyVault public vault;
    AggregatorV3Interface public oracle; // Chainlink for resolution (returns 0 or 100 on event)
    uint256 public currentPrice = 50 * 1e16; // Start at 50%, scaled 1e18
    uint256 public fundingInterval = 8 hours;
    uint256 public lastFundingTime;
    uint256 public fundingRate; // Positive: longs pay shorts
    bool public resolved;
    uint256 public resolutionTime; // Timestamp for oracle call

    // Position struct (per user for prod)
    struct Position {
        bool isLong;
        uint256 size; // Contracts
        uint256 entryPrice;
        uint256 collateral;
    }
    mapping(address => Position) public positions;

    event Trade(address indexed user, bool isLong, uint256 size, uint256 price);
    event FundingPaid(uint256 rate);
    event Resolved(bool outcome);

    constructor(address _vault, address _oracle, uint256 _resolutionTime, address _owner) Ownable(_owner) {
        vault = CounterpartyVault(_vault);
        oracle = AggregatorV3Interface(_oracle);
        resolutionTime = _resolutionTime;
        lastFundingTime = block.timestamp;
    }

    // Open position (market order for MVP)
    function openPosition(bool isLong, uint256 size, uint256 collateral) external nonReentrant {
        require(!resolved, "Market resolved");
        require(collateral > 0 && size > 0, "Invalid");
        vault.usdc().safeTransferFrom(msg.sender, address(vault), collateral);

        // Simulate matching: Vault as counterparty
        uint256 fee = (size * currentPrice) / 1e18 / 100; // 1% example
        vault.applyFee(fee, isLong, currentPrice);

        positions[msg.sender] = Position(isLong, size, currentPrice, collateral);
        emit Trade(msg.sender, isLong, size, currentPrice);

        // Update price (simple AMM-like shift for MVP)
        currentPrice = isLong ? currentPrice + 1e16 : currentPrice - 1e16; // Adjust based on size in prod


    }

    // Close position
    function closePosition() external nonReentrant {
        Position memory pos = positions[msg.sender];
        require(pos.size > 0, "No position");

        int256 pnl = calculatePNL(msg.sender);
        vault.settlePNL(pnl);
        if (pnl > 0) {
            vault.usdc().safeTransfer(msg.sender, uint256(pnl) + pos.collateral);
        } else {
            vault.usdc().safeTransfer(msg.sender, pos.collateral - uint256(-pnl));
        }
        delete positions[msg.sender];
    }

    // Funding: Call periodically
    function applyFunding() external {
        if (block.timestamp >= lastFundingTime + fundingInterval) {
            // Calc rate: (currentPrice - fairValue) / duration; fairValue could be external oracle
            fundingRate = (currentPrice - 50 * 1e16) / 1e16; // Simplified
            // Apply to positions (in prod, loop or use accumulators)
            // e.g., longs pay if rate >0
            lastFundingTime = block.timestamp;
            emit FundingPaid(fundingRate);
        }
    }

    // Resolve: Anyone can call after time
    function resolve() external {
        require(block.timestamp >= resolutionTime && !resolved, "Not resolvable");
        (, int256 outcome,,,) = oracle.latestRoundData(); // Assume 0 or 100
        resolved = true;
        currentPrice = (outcome == 100) ? 100 * 1e16 : 0; // Fixed: ==100, not ==1
        emit Resolved(outcome == 100); // Fixed: ==100
        // Force close all positions in prod
    }

    // Helper: PNL calc
    function calculatePNL(address user) public view returns (int256) {
        Position memory pos = positions[user];
        if (pos.size == 0) return 0;
        int256 priceDiff = int256(currentPrice) - int256(pos.entryPrice);
        return pos.isLong ? (priceDiff * int256(pos.size)) / 1e18 : (-priceDiff * int256(pos.size)) / 1e18;
    }
}