"use client";

import { type ReactNode } from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { type State, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { walletConnectProjectId, project, wagmi } from "@/config";

interface Props {
  children?: ReactNode;
  initialState?: State;
}

// ref: https://docs.walletconnect.com/appkit/next/core/installation
const queryClient = new QueryClient();

// create the modal
const { config, metadata } = wagmi;
createWeb3Modal({
  wagmiConfig: config,
  projectId: metadata.projectId,
});

export default function Web3ModalProvider({ children, initialState }: Props) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
