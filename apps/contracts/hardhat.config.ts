import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@semaphore-protocol/hardhat";
import "@typechain/hardhat";
import { config as dotenvConfig } from "dotenv";
import "hardhat-gas-reporter";
import { HardhatUserConfig } from "hardhat/config";
import { NetworksUserConfig } from "hardhat/types";
import { resolve } from "path";
import "solidity-coverage";
import "hardhat-circom";
import "./tasks/deploy";

dotenvConfig({ path: resolve(__dirname, "../../.env") });

function getNetworks(): NetworksUserConfig {
  if ((!process.env.INFURA_API_KEY && !process.env.ALCHEMY_API_KEY) || !process.env.ETHEREUM_PRIVATE_KEY) {
    return {};
  }

  const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`];
  const [infuraApiKey, alchemyApiKey] = [process.env.INFURA_API_KEY, process.env.ALCHEMY_API_KEY];

  return {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
      chainId: 11155111,
      accounts
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${infuraApiKey}`,
      chainId: 80001,
      accounts
    },
    "optimism-sepolia": {
      url: "https://opt-sepolia.g.alchemy.com/v2/${alchemyApiKey}",
      chainId: 11155420,
      accounts
    },
    "arbitrum-sepolia": {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts
    },
    arbitrum: {
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts
    }
  };
}

const hardhatConfig: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      // We hit the "Stack too deep. Try compiling with `--via-ir` (cli) or the equivalent
      //   `viaIR: true` (standard JSON) while enabling the optimizer. Otherwise, try removing
      //   local variables." problem. So we enable it.
      //   ref: https://hardhat.org/hardhat-runner/docs/reference/solidity-support#support-for-ir-based-codegen
      viaIR: true,
      optimizer: {
        enabled: false,
        // enabled: true,
        // runs: 77,
        // details: {
        //   yulDetails: {
        //     optimizerSteps: "u",
        //   },
        // },
      },
    }
  },
  defaultNetwork: process.env.DEFAULT_NETWORK || "localhost",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
    },
    ...getNetworks()
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS === "true",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY
  },
  typechain: {
    target: "ethers-v6"
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  sourcify: {
    enabled: true
  },
  circom: {
    inputBasePath: "./circuits",
    outputBasePath: "./circuits/artifacts",
    // ptau files: https://github.com/iden3/snarkjs?tab=readme-ov-file#7-prepare-phase-2
    ptau: "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_17.ptau",
    circuits: [
      {
        name: "lib",
        protocol: "plonk"
      }
    ]
  }
};

export default hardhatConfig;
