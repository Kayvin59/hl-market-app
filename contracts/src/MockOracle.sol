// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/interfaces/AggregatorV3Interface.sol";

/// @title MockOracle
/// @notice Minimal mock implementation of Chainlink's AggregatorV3Interface
///         for local testing and MVP usage.
///         - Owner can manually set outcomes.
///         - Simulates round data updates like a real oracle.
contract MockOracle is AggregatorV3Interface {
    address public owner;
    int256 private answer;
    uint80 private roundId;
    uint8 private constant DECIMALS = 0; // Changed to 0 for integer 0-100 scaling

    event AnswerUpdated(int256 newAnswer, uint80 newRoundId); // Added event for debugging/UX

    constructor(int256 initialAnswer) {
        owner = msg.sender;
        answer = initialAnswer;
        roundId = 1;
    }

    /// @notice Set the oracle answer manually (e.g. 0 = No, 100 = Yes)
    function setAnswer(int256 _answer) external {
        require(msg.sender == owner, "Not authorized");
        answer = _answer;
        roundId++;
        emit AnswerUpdated(_answer, roundId);
    }

    // ---- AggregatorV3Interface standard functions ----

    function decimals() external pure override returns (uint8) {
        return DECIMALS;
    }

    function description() external pure override returns (string memory) {
        return "Mock Binary Oracle";
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        require(_roundId <= roundId && _roundId > 0, "No data for round");
        return (_roundId, answer, block.timestamp, block.timestamp, _roundId);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80,
            int256,
            uint256,
            uint256,
            uint80
        )
    {
        return (roundId, answer, block.timestamp, block.timestamp, roundId);
    }

    // Added getter for frontend polling
    function getCurrentAnswer() external view returns (int256) {
        return answer;
    }
}