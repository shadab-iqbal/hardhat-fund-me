// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

// just importing the contract directly is enough for us
// this contract is needed so that we can use the AggregatorV3Interface
// for even our localhost networks
import "@chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";
