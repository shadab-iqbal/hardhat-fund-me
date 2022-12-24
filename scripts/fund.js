// this script is just to interact with the fund function of the contract without any frontend

const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  // using the following way, directly returns the deployer address
  // const { deployer } = await getNamedAccounts();
  const deployer = (await ethers.getSigners())[0];
  const fundMe = await ethers.getContract("FundMe", deployer);

  const txResponse = await fundMe.fund({
    value: ethers.utils.parseEther("1000"),
  });
  const txReceipt = await txResponse.wait(1);

  console.log("Funding transaction done!");

  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`\nDeployer new balance: ${deployerBalance}`);
}

main().catch((e) => {
  console.log(e);
});
