import { HardhatUserConfig } from "hardhat/config";
import "@matterlabs/hardhat-zksync";

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.5.15",
    settings: {
      codegen: "yul",
    },
  },
  defaultNetwork: "abstractTestnet",
  networks: {
    abstractTestnet: {
      url: "https://api.testnet.abs.xyz",
      ethNetwork: "sepolia",
      zksync: true,
      chainId: 11124,
    },
    abstractMainnet: {
      url: "https://api.mainnet.abs.xyz",
      ethNetwork: "mainnet",
      zksync: true,
      chainId: 2741,
    },
  },
  solidity: {
    version: "0.8.24",
  },
  paths: {
    sources: "./contracts",
  },
};

export default config;
