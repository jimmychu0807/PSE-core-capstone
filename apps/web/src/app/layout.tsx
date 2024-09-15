import type { Metadata } from "next";
import { Inter as interFonts } from "next/font/google";
import "./globals.css";
import { cookieToInitialState } from "wagmi";
import { headers } from "next/headers";

import { wagmi, projectInfo } from "@/config";
import { Web3ModalProvider, ChakraProvider, LogContextProvider } from "@/context";
import { PageContainer } from "@/components";

const inter = interFonts({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: projectInfo.name,
  description: projectInfo.desc,
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  metadataBase: new URL(projectInfo.homepage),
  openGraph: {
    type: "website",
    url: projectInfo.homepage,
    title: projectInfo.name,
    description: projectInfo.desc,
    siteName: projectInfo.name,
    images: [
      {
        url: projectInfo.image,
      },
    ],
  },
  twitter: { card: "summary_large_image", images: projectInfo.image },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(wagmi.config, headers().get("cookie"));

  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3ModalProvider initialState={initialState}>
          <LogContextProvider>
            <ChakraProvider>
              <PageContainer>{children}</PageContainer>
            </ChakraProvider>
          </LogContextProvider>
        </Web3ModalProvider>
      </body>
    </html>
  );
}
