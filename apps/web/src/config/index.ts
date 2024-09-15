import { defineChain } from "viem";
import { cookieStorage, createStorage } from "wagmi";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import {
  sepolia, // Ethereum
  optimismSepolia, // Optimism
} from "wagmi/chains";

import * as GameJson from "@contract-artifacts/GuessingGame.json";

// IMPROVE: can you get this GameState from hardhat compilation?
export enum GameState {
  GameInitiated = 0,
  RoundCommit,
  RoundOpen,
  RoundEnd,
  GameEnd,
}

export const MIN_PLAYERS_TO_START = 3;

export const gameEventTypes = {
  newGame: "NewGame",
} as const;

export const walletConnectProjectId = process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"] as string;

// GuessingGAme contract deployed address
export const deployedAddress = process.env["NEXT_PUBLIC_GUESSING_GAME_CONTRACT_ADDRESS"] as string;

export const gameArtifact = {
  ...GameJson,
  // Added a new property of the deployed address.
  // Since we used CREATE2 to deploy contract (https://hardhat.org/ignition/docs/guides/create2),
  //   the deployed address should be the same across all chains.
  deployedAddress,
} as const;

export const RpcUrls = {
  sepolia: `https://eth-sepolia.g.alchemy.com/v2/${process.env["NEXT_PUBLIC_ALCHEMY_API_KEY"]}`,
  optimismSepolia: `https://opt-sepolia.g.alchemy.com/v2/${process.env["NEXT_PUBLIC_ALCHEMY_API_KEY"]}`,
  devChain: "http://localhost:8545",
};

export const projectInfo = {
  name: "PSE Capstone - Number Guessing Game",
  desc: "Guessing game using zk-SNARKS",
  homepage: "https://github.com/jimmychu0807/PSE-core-self-capstone",
  authorHomepage: "https://jimmychu0807.hk",
  github: "https://github.com/jimmychu0807/PSE-core-self-capstone",
  image: "https://avatars.githubusercontent.com/u/898091?v=4",
};

const devChain = defineChain({
  id: 1337,
  name: "Hardhat Node",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
});

export const supportedChains =
  process.env["NEXT_PUBLIC_ENV"] === "testnet"
    ? { sepolia, optimismSepolia }
    : { sepolia, optimismSepolia, devChain };

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
    chains: Object.values(supportedChains),
    projectId: walletConnectProjectId,
    metadata: wagmiMetadata,
    enableWalletConnect: true,
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
  }),
};
