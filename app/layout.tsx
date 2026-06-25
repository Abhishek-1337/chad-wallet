import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChadWallet — Trade Solana at the Speed of Chad",
  description:
    "Solana-native self-custody wallet with built-in trading, real-time prices, and one-click swaps. No seed phrases. No delays. Just Chad.",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
