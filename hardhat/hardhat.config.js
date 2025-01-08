require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28", // Specifies the Solidity compiler version
  defaultNetwork: "localhost", // Default network to use
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // URL for the local Hardhat network
    },
  },
  paths: {
    artifacts: "./artifacts", // Specify where the compiled contract artifacts will be stored
    cache: "./cache", // Specify the cache directory
    sources: "./contracts", // Specify where your Solidity files are located
    tests: "./test", // Specify where your test files are located
  },
};
