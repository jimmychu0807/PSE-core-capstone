import { defineChain, type Chain, type Address } from "viem";
import { cookieStorage, createStorage } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import {
  optimismSepolia, // Optimism testnet
} from "wagmi/chains";

import * as GameJson from "@contract-artifacts/GuessingGame.json";

export const { abi: GameContractAbi } = GameJson;

/**
 * The following values have to be consistent with the smart contract setting.
 * Refer to:
 *   - /apps/contracts/contracts/base/Constants.sol
 *   - /apps/contracts/contracts/interfaces/IGuessingGame.sol
 **/

export const GameEvent = {
  newGame: "NewGame",
} as const;

export const GameConfig = {
  MIN_NUM: 1,
  MAX_NUM: 100,
  ROUNDS_TO_WIN: 3,
  MIN_PLAYERS_TO_START: 3,
};

// --- End of GuessingGame smart contract constants ---

export const walletConnectProjectId = process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"] as string;

// GuessingGAme contract deployed address
export const deployedAddress = process.env["NEXT_PUBLIC_GUESSING_GAME_CONTRACT_ADDRESS"] as Address;

export const RpcUrls = {
  optimismSepolia: `https://opt-sepolia.g.alchemy.com/v2/${process.env["NEXT_PUBLIC_ALCHEMY_API_KEY"]}`,
  devChain: "http://localhost:8545",
};

export const projectInfo = {
  name: "PSE Capstone - Number Guessing Game",
  desc: "Guessing game using zk-SNARKS",
  homepage: "https://guessing.jimmychu0807.hk",
  authorHomepage: "https://linktr.ee/jimmychu0807",
  github: "https://github.com/jimmychu0807/PSE-core-capstone",
  image: "https://avatars.githubusercontent.com/u/898091?v=4",
  psePage: "https://pse.dev/en/programs",
};

const devChain = defineChain({
  id: 1337,
  name: "Hardhat Node",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
});

export const chains: readonly [Chain, ...Chain[]] =
  process.env["NEXT_PUBLIC_ENV"] === "development"
    ? [optimismSepolia, devChain]
    : [optimismSepolia];

const wagmiMetadata = {
  name: projectInfo.name,
  description: projectInfo.desc,
  url: projectInfo.homepage, // origin must match your domain & subdomain
  projectId: walletConnectProjectId,
  icons: [projectInfo.image],
};

export const wagmi = {
  metadata: wagmiMetadata,
  config: defaultWagmiConfig({
    chains,
    projectId: walletConnectProjectId,
    metadata: wagmiMetadata,
    enableWalletConnect: true,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
  }),
};
