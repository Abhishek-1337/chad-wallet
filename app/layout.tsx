import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ChadWallet — Trade Solana at the Speed of Chad",
  description:
    "Solana-native self-custody wallet with built-in trading, real-time prices, and one-click swaps. No seed phrases. No delays. Just Chad.",
  icons: {
    icon: "/logo/dark.png",
  },
  openGraph: {
    title: "ChadWallet",
    description: "The wallet that trades while others wait.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
