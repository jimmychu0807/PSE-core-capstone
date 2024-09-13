import { defineChain } from "viem";

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

// GuessingGAme contract deployed address
export const deployedAddress = process.env.NEXT_PUBLIC_GUESSING_GAME_CONTRACT_ADDRESS as string;

export const RpcUrls = {
  sepolia: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  optimismSepolia: `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  arbitrumSepolia: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  devChain: "http://localhost:8545",
};

export const project = {
  name: "PSE Capstone - Number Guessing Game",
  desc: "Guessing game using zero-knowledge protocol.",
  homepage: "https://github.com/jimmychu0807/PSE-core-self-capstone",
  authorHomepage: "https://jimmychu0807.hk",
  github: "https://github.com/jimmychu0807/PSE-core-self-capstone",
  image: "https://avatars.githubusercontent.com/u/898091?v=4",
};

export const devChain = defineChain({
  id: 1337,
  name: "Hardhat Node",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
});
