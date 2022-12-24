// this helper file contains info which is needed for deployment and also
// makes it easy to use the aggregatorv3interface for local networks.

// we need to specify the chainlink priceFeed address for different networks
// key is the chainId, and value is the details for that chainId
const networkConfig = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};

const developmentChains = ["hardhat", "localhost"];
// the following 2 variables are needed for the constructor parameters of mockv3aggregator
// basically, we are manually setting the value of USD per ETH
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
