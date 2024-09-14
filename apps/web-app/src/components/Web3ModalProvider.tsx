"use client";

import { ReactNode } from "react";
import { createWeb3Modal } from "@web3modal/wagmi/react";
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config";
import { WagmiProvider, cookieStorage, createStorage } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { walletConnectProjectId, project, wagmi } from "@/consts";

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

export function Web3ModalProvider({ children, initialState }: Props) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
