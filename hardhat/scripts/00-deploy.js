const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying the smart contract....")
  const Funding = await ethers.getContractFactory("CrowdFunding")
  const accounts = await ethers.getSigners()
  const funding = await Funding.connect(accounts[0]).deploy()
  // Remove the .deployed() call and wait for the deployment transaction
  await funding.waitForDeployment()
  // Use getAddress() to get the contract address
  console.log(`CrowdFunding is deployed in address ${await funding.getAddress()}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })