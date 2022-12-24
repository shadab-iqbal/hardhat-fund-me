// this script is just to interact with the withdraw function of the contract without any frontend

const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  // using the following way, directly returns the deployer address
  // const { deployer } = await getNamedAccounts();
  const deployer = (await ethers.getSigners())[0];
  const fundMe = await ethers.getContract("FundMe", deployer);

  const txResponse = await fundMe.withdraw();
  const txReceipt = await txResponse.wait(1);

  console.log("Withdrawal transaction done!");

  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`\nDeployer new balance: ${deployerBalance}`);
}

main().catch((e) => {
  console.log(e);
});
