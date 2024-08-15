import { defineChain } from "viem";

/***
 * TODO: set the right API key
 */

export const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

export const RpcUrls = {
  sepolia: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  optimismSepolia: `https://opt-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  arbitrumSepolia: `https://arb-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
  devChain: "http://localhost:8545"
};

export const project = {
  name: "PSE Hackathon - Guessing Game",
  desc: "Guessing game using zero-knowledge protocol.",
  homepage: "https://github.com/jimmychu0807/PSE-core-hackathon",
  authorHomepage: "https://jimmychu0807.hk",
  github: "https://github.com/jimmychu0807/PSE-core-hackathon",
  image: "https://avatars.githubusercontent.com/u/898091?v=4"
};

export const devChain = defineChain({
  id: 31337,
  name: "Hardhat Node",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] }
  }
});
