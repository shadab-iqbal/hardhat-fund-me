// staging tests are done after deploying on the testnet,
// they are the last stage of test before deploying on the mainnet

const { assert, expect } = require("chai");
const { ethers, network, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

if (developmentChains.includes(network.name)) return;

describe("FundMe", function () {
  // parseEther will transfer the amount from ETH to WEI
  const fundedAmount = ethers.utils.parseEther("1");
  let fundMe, deployer;

  beforeEach(async function () {
    // we are not deploying, as we are assuming that they are already deployed on the testnet
    // fetching the deployer object
    deployer = (await ethers.getSigners())[0];
    fundMe = await ethers.getContract("FundMe", deployer);
  });

  it("should fund and withdraw correctly", async function () {
    await fundMe.fund({ value: fundedAmount });
    await fundMe.withdraw();
    assert.equal(await ethers.provider.getBalance(fundMe.address), 0);
  });
});
