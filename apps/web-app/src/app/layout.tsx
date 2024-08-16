import PageContainer from "@/components/PageContainer";
import type { Metadata } from "next";
import Providers from "./providers";
import { project } from "../consts";

export const metadata: Metadata = {
  title: project.name,
  description: project.desc,
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <PageContainer>{children}</PageContainer>
        </Providers>
      </body>
    </html>
  );
}
