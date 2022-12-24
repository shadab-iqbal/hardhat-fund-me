const { network } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper-hardhat-config");

// this is needed to deploy the MockV3Aggregator contract

module.exports = async (hre) => {
  const { deploy, log } = hre.deployments;
  // this will get the account number for a particular network
  const { deployer } = await hre.getNamedAccounts();
  // chainId is needed so that we can select which address to use for fetching the price
  const networkName = network.name;

  // this deployment will only occur when we are deploying the contract on a local network
  // because mockv3aggregator is not needed in actual testnets as there are actual v3aggregators for those
  if (developmentChains.includes(networkName)) {
    log("Local network detected! Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    });
    log("Mocks Deployed!");
    log("-----------------------------------------------------");
  }
};

// this tag is attached so that we can deploy only the mock(not any other contract), if we want
module.exports.tags = ["all", "mocks"];
