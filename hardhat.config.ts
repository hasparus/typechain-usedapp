import { HardhatUserConfig, task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-gas-reporter";
import "solidity-coverage";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(addressWithBalance(account, hre));
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0,
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/Dr5usbY6KnDFmPBD-ky7I1J8DBny-i-G",
        blockNumber: 13485726,
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  typechain: {},
};

export default config;

async function addressWithBalance(
  { address }: { address: string },
  hre: HardhatRuntimeEnvironment
) {
  const balance = await hre.ethers.provider.getBalance(address);
  return `${address} ${hre.ethers.utils.formatEther(balance)} ETH`;
}
