const { assert, expect } = require("chai");
const { deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) return;

describe("FundMe", function () {
  const fundedAmount = "60000000000000000";
  let fundMe, deployer;

  beforeEach(async function () {
    // running every deployment scripts containing the tag "all"
    // and we used this tag in all the scripts, so basically we are running "yarn hardhat deploy"
    await deployments.fixture(["all"]);
    // retrieving the deployer account from our hardhat.config.js file
    // deployer = (await getNamedAccounts()).deployer;
    // retrieving the deployer account using ethers
    // N.B: ethers.getSigners() returns the "accounts" array set in hardhat.config.js file
    //      this "accounts" array contains account objects, NOT ONLY addresses
    deployerObject = (await ethers.getSigners())[0];
    deployer = deployerObject.address;
    // getting the contract in the following way actually lets us interact with the contract
    // the "deployerObject" argument specifies, with which account, interaction with the contract will be done
    fundMe = await ethers.getContract("FundMe", deployerObject);
    // getting the contract in the following way returns us address, receipt, abi, bytecode etc
    // fundMe = await deployments.get("FundMe");
    // console.log(fundMe);
  });

  describe("constructor", async function () {
    it("should set aggregator address correctly", async function () {
      // we can retrieve the public variables of contract by calling functions with their names
      // aggregatorAddress should be set in the constructor of the FundMe contract
      const aggregatorAddress = await fundMe.priceFeed();
      const mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
      assert.equal(aggregatorAddress, mockV3Aggregator.address);
    });

    it("should set the owner of contract correctly", async function () {
      const ownerAddress = await fundMe.i_owner();
      // the deployer itself should be the contract owner
      assert.equal(ownerAddress, deployer);
    });
  });

  describe("fund", async function () {
    // this is the test case for handling failure
    // "assert" is NOT possible here, so using "expect"
    it("should revert the transaction if insufficient funds", async function () {
      await expect(fundMe.fund({ value: "40000000000000" })).to.be.revertedWith(
        "Please pay the minimum amount"
      );
    });

    it("should update info regarding funders and funded amount", async function () {
      // sending money from deployer to contract
      await fundMe.fund({ value: fundedAmount });
      // checking if funders array is updated
      assert.equal(await fundMe.funders(0), deployer);
      // checking if addressToAmountFunded mapping is updated
      assert.equal(await fundMe.addressToAmountFunded(deployer), fundedAmount);
    });
  });

  describe("withdraw", async function () {
    // this is needed because the contract will always have to have some money before we can withdraw
    beforeEach(async function () {
      await fundMe.fund({ value: fundedAmount });
    });

    it("should withdraw correctly when one funder", async function () {
      // contract.provider.getBalance(address) is for retrieving the current balance
      const initialContractBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const initialDeployerBalance = await ethers.provider.getBalance(deployer);

      // determining the gas cost from the transaction receipt
      // need to use BigNumber for calculation, because contracts return a BigNumber value usually
      const txResponse = await fundMe.withdraw();
      const txReceipt = await txResponse.wait(1);
      const { gasUsed, effectiveGasPrice } = txReceipt;
      const totalGasCost = gasUsed.mul(effectiveGasPrice);

      const updatedDeployerBalance = await ethers.provider.getBalance(deployer);
      const updateContractBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      // newBalance = currentBalance - gasCost + contractBalance
      const expectedDeployerBalance = initialDeployerBalance
        .sub(totalGasCost)
        .add(initialContractBalance);

      // converting to toString before comparison, because returned values are BigNumbers
      assert.equal(updateContractBalance.toString(), "0");
      assert.equal(
        updatedDeployerBalance.toString(),
        expectedDeployerBalance.toString()
      );
    });

    it("should withdraw correctly when multiple funders", async function () {
      // this is how we can connect to multiple accounts and interact with the contract with those accounts
      // here, we are basically funding the contract through multiple accounts
      const accounts = await ethers.getSigners();
      // starting from index 1, as deployer has already funded in beforeEach function
      for (let i = 1; i < accounts.length; ++i) {
        // we can use ethers.getContract() using both account object or account.address
        // but to use contract.connect(), we must have to only use account object
        const connectedContract = await fundMe.connect(accounts[i]);
        await connectedContract.fund({ value: fundedAmount });
      }

      // checking if (contract fund = number of accounts * amount funded by each)
      assert.equal(
        (await ethers.provider.getBalance(fundMe.address)).toString(),
        +fundedAmount * accounts.length // "+" converts string to integer
      );

      // withdrawing again like the previous "it" test, but minimal code
      const initialContractBalance = await ethers.provider.getBalance(
        fundMe.address
      );
      const initialDeployerBalance = await ethers.provider.getBalance(deployer);
      const txReceipt = await (await fundMe.withdraw()).wait(1);
      const totalGasCost = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);
      const expectedDeployerBalance = initialDeployerBalance
        .sub(totalGasCost)
        .add(initialContractBalance);

      assert.equal(
        (await ethers.provider.getBalance(fundMe.address)).toString(),
        "0"
      );
      assert.equal(
        (await ethers.provider.getBalance(deployer)).toString(),
        expectedDeployerBalance
      );

      // testing if the funders array is reset by checking the index 0
      await expect(fundMe.funders(0)).to.be.reverted;
      // testing if all the values of addressToAmountFunded is 0
      for (let i = 0; i < accounts.length; ++i) {
        assert.equal(
          await fundMe.addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("should revert withdraw if caller is any user other than deployer", async function () {
      const [deployer, user1, ...users] = await ethers.getSigners();
      const connectedAccount = await fundMe.connect(user1);
      // this is how to test CUSTOM errors
      await expect(connectedAccount.withdraw()).to.be.revertedWithCustomError(
        fundMe,
        "FundMe__NotOwner"
      );
    });
  });
});
