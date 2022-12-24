require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC_URL, // the url to connect to the "node as a service" provided by alchemy
      accounts: [process.env.GOERLI_PRIVATE_KEY], // this is found from metamask wallet account
      chainId: 5,
      blockConfirmations: 5, // this refers to the waiting time before confirming the block, similar to contract.wait(5)
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      // accounts: hardhat provides accounts by itself
      chainId: 31337,
      blockConfirmations: 1,
    },
  },
  // to verify the contract on etherscan, we need this api key
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  // gasReporter is used to calculate the gas fees our contract is consuming
  gasReporter: {
    enabled: true, // if gasReport will be enabled or not
    outputFile: "gas-report.txt", // the file where the report will be generated
    noColors: true, // this is set so that random weird characters doesn't pop up in output fileß
    currency: "usd", // the currency in which the price will be shown
    coinmarketcap: process.env.COINMARKETCAP_API_KEY, // where to get the conversion rate from
    token: "ETH", // we can also set this to MATIC to estimate the price if deployed on polygon
  },
  // "hre.getNamedAccounts()" in "deploy-fundme.js" takes values from here
  // this is optional, what this does basically is,
  // gives a name to each index of the accounts array for a network
  namedAccounts: {
    // we can specify accounts for deployer, user1, user2, ...
    // when data retrived using getNamedAccounts(), addresses of the accounts are returned only
    deployer: {
      // key will be chainId, and value will be the index in accounts array, which is to be used for deploying
      default: 0, // this will by default, take the first account as deployer
      5: 0, // on goerli also, we will consider the first account from the array, which will deploy the smart contract
    },
  },
};
