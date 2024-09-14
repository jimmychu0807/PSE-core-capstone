import type { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { Web3ModalProvider } from "@/components/Web3ModalProvider";
import Providers from "@/app/providers";
import { project, wagmi } from "@/consts";
import PageContainer from "@/components/PageContainer";

export const metadata: Metadata = {
  title: project.name,
  description: project.desc,
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  metadataBase: new URL(project.homepage),
  openGraph: {
    type: "website",
    url: project.homepage,
    title: project.name,
    description: project.desc,
    siteName: project.name,
    images: [
      {
        url: project.image,
      },
    ],
  },
  twitter: { card: "summary_large_image", images: project.image },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const initialState = cookieToInitialState(wagmi.config, headers().get("cookie"));
  return (
    <html lang="en">
      <body>
        <Providers>
          <Web3ModalProvider>
            <PageContainer>{children}</PageContainer>
          </Web3ModalProvider>
        </Providers>
      </body>
    </html>
  );
}
