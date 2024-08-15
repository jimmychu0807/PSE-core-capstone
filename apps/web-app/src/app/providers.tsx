"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider } from "@chakra-ui/react";
import { Web3ModalProvider } from "../components/Web3ModalProvider";
import { LogContextProvider } from "@/context/LogContext";
import theme from "../styles/index";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <Web3ModalProvider>
          <LogContextProvider>{children}</LogContextProvider>
        </Web3ModalProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
