// network is automatically imported, but it's good to be always explicit
const { network } = require("hardhat");
// networkConfig contains the priceFeed address for different networks and
// developmentChains contains the list of all the local networks used for development
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
// this function is needed for verification on etherscan
const { verify } = require("../utils/verify");
require("dotenv").config();

// when "yarn hardhat deploy" is run, it will look for the module which this file exports
// also, the "hre" will be passed as a parameter

module.exports = async (hre) => {
  const { deploy, log, get } = hre.deployments;
  // this will get the account number for a particular network
  const { deployer } = await hre.getNamedAccounts();
  // chainId is needed so that we can select which address to use for fetching the price
  const chainId = network.config.chainId;

  // this variable will contain the address of AggregatorV3Interface for price fetching
  let ethUsdPriceFeedAddress;
  // if the network is a local network, we set the address of the aggregator
  // to the address of the deployed mock smart contract
  if (developmentChains.includes(network.name)) {
    // get method allows us to get a already deployed smart contract
    const contract = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = contract.address;
  } else {
    // IF NOT local network, then fetch the address directly from "helper-hardhat-config" file
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }

  // this is where the actual deployment of the FundMe contract will occur
  // we are saving the arguments in a variable because we will be reusing it several times
  args = [ethUsdPriceFeedAddress];
  log("Deploying Fundme...");
  const fundMe = await deploy("FundMe", {
    from: deployer, // we configured this in the "hardhat.config.js" file
    log: true, // it prints out details during deployment
    args: args, // this will be sent to the constructor of the FundMe contract
    waitConfirmations: network.config.blockConfirmations || 1, // basically telling how many blocks to wait before confirmation, if none is set, 1 block will be waited
  });
  log("Fundme Deployed!");
  log("-----------------------------------------------------");

  // only verify WHEN the contract is NOT deployed on a local network
  // it is also important to check if the etherscan api key is available or not
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }
};

// this tag is attached so that we can deploy with this script(not any other script), if we want
module.exports.tags = ["all", "fundme"];
