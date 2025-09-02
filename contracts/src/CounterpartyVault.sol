// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Added: Standard IERC20 import
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CounterpartyVault is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20; // Changed: For IERC20, not IUSDC

    IERC20 public immutable usdc; // Changed: IERC20 instead of IUSDC
    uint256 public totalAssets; // Total USDC in vault
    uint256 public biasThreshold = 60 * 1e16; // 60% prob, scaled 1e18
    uint256 public biasFeeMultiplier = 120; // 20% extra fee on biased side
    uint256 public baseFee = 10; // 0.1% base fee (scaled 1e3)
    address public perpMarket; // Linked PerpMarket contract

    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 shares, uint256 amount);

    constructor(address _usdc, address _owner) ERC20("VaultLP", "VLP") Ownable(_owner) {
        usdc = IERC20(_usdc);
    }

    function setPerpMarket(address _perpMarket) external onlyOwner {
        perpMarket = _perpMarket;
    }

    // LP Deposit: Mint shares proportional to assets
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        uint256 shares = totalSupply() == 0 ? amount : (amount * totalSupply()) / totalAssets;
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        totalAssets += amount;
        _mint(msg.sender, shares);
        emit Deposit(msg.sender, amount, shares);
    }

    // LP Withdraw: Burn shares, send proportional assets
    function withdraw(uint256 shares) external nonReentrant {
        require(shares > 0 && shares <= balanceOf(msg.sender), "Invalid shares");
        uint256 amount = (shares * totalAssets) / totalSupply();
        _burn(msg.sender, shares);
        totalAssets -= amount;
        usdc.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, shares, amount);
    }

    // Called by PerpMarket: Apply trade fee with bias
    function applyFee(uint256 fee, bool isLong, uint256 currentPrice) external {
        require(msg.sender == perpMarket, "Only PerpMarket");
        uint256 adjustedFee = fee * baseFee / 1000;
        if (isLong && currentPrice > biasThreshold) {
            adjustedFee = adjustedFee * biasFeeMultiplier / 100; // Bias against "yes"
        }
        // Distribute fee to vault (LPs earn)
        totalAssets += adjustedFee;
    }

    // Called by PerpMarket: Settle PNL (vault pays/ receives)
    function settlePNL(int256 pnl) external {
        require(msg.sender == perpMarket, "Only PerpMarket");
        if (pnl > 0) {
            // Vault pays trader: reduce assets
            totalAssets -= uint256(pnl);
        } else if (pnl < 0) {
            // Trader pays vault: add assets
            totalAssets += uint256(-pnl);
        }
    }

    // Admin: Adjust bias params
    function setBias(uint256 _threshold, uint256 _multiplier) external onlyOwner {
        biasThreshold = _threshold;
        biasFeeMultiplier = _multiplier;
    }

    // Rebalance: Simple reserve skew (e.g., hold more for shorts). In prod, integrate external hedging.
    function rebalance() external onlyOwner {
        // Placeholder: Could call external perp to open hedge positions.
    }
}