// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {CounterpartyVault} from "src/CounterpartyVault.sol";
import {PredictionPerp} from "src/PredictionPerp.sol";
import {MockOracle} from "src/MockOracle.sol";

contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy MockOracle with initial answer=50 (neutral)
        MockOracle mockOracle = new MockOracle(50);

        // Deploy Vault
        address usdc = 0xAb16Fd3CD7882734fF3A5755b80c724b96617c53;
        CounterpartyVault vault = new CounterpartyVault(usdc, msg.sender);

        // Deploy Perp (oracle addr, resolution timestamp; stub for MVP)
        uint256 resolutionTime = block.timestamp + 30 days; // Example; for real event, use fixed UNIX e.g., 1735689600 for Jan 1, 2026 UTC
        PredictionPerp perp = new PredictionPerp(address(vault), address(mockOracle), resolutionTime, msg.sender);

        // Link contracts
        vault.setPerpMarket(address(perp));

        vm.stopBroadcast();

        // Log addresses (view in console)
        console.log("MockOracle deployed at:", address(mockOracle));
        console.log("Vault deployed at:", address(vault));
        console.log("Perp deployed at:", address(perp));
    }
}