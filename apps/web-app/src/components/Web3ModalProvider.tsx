import { ReactNode } from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider } from "wagmi";
import {
  sepolia, // Ethereum
  optimismSepolia, // Optimism
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { walletConnectProjectId, project, devChain } from "../consts";
import { PublicClientProvider } from "./PublicClientContext";

interface Props {
  children?: ReactNode;
  // any props that come into the component
}

// ref: https://docs.walletconnect.com/web3modal/react/about?platform=wagmi
const queryClient = new QueryClient();
const metadata = {
  name: project.name,
  description: project.desc,
  url: project.homepage,
  icons: [project.image],
};

const supportedChains = { sepolia, optimismSepolia };
// Add the hardhat node devnet
const chains = process.env.NEXT_PUBLIC_ENV ? { ...supportedChains, devChain } : supportedChains;

const wagmiConfig = defaultWagmiConfig({
  chains: Object.values(chains),
  projectId: walletConnectProjectId,
  metadata,
});

// create the modal
createWeb3Modal({
  wagmiConfig,
  projectId: walletConnectProjectId,
  enableAnalytics: true,
});

export function Web3ModalProvider({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PublicClientProvider chains={chains}>{children}</PublicClientProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
