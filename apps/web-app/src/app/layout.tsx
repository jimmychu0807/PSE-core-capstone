import PageContainer from "@/components/PageContainer";
import type { Metadata } from "next";
import Providers from "./providers";
import { LogContextProvider } from "@/context/LogContext";
import { SemaphoreContextProvider } from "@/context/SemaphoreContext";

export const metadata: Metadata = {
  title: "PSE Hackathon - Guessing Game",
  description: "Guessing game using zero-knowledge protocol.",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  metadataBase: new URL("https://github.com/jimmychu0807/PSE-core-hackathon"),
  openGraph: {
    type: "website",
    url: "https://github.com/jimmychu0807/PSE-core-hackathon",
    title: "PSE Hackathon - Guessing Game",
    description: "Guessing game using zero-knowledge protocol.",
    siteName: "PSE Hackathon - Guessing Game",
    images: [
      {
        url: "https://avatars.githubusercontent.com/u/898091?v=4"
      }
    ]
  },
  twitter: { card: "summary_large_image", images: "https://avatars.githubusercontent.com/u/898091?v=4" }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <LogContextProvider>
            <PageContainer>{children}</PageContainer>
          </LogContextProvider>
        </Providers>
      </body>
    </html>
  );
}

// Archieving Semaphore original rootlayout
export function SemaphoreRootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <SemaphoreContextProvider>
            <LogContextProvider>
              <PageContainer>{children}</PageContainer>
            </LogContextProvider>
          </SemaphoreContextProvider>
        </Providers>
      </body>
    </html>
  );
}
