"use client";

import Link from "next/link";
import WalletButton from "./WalletButton";

export default function Navbar() {
  return (
    <header className="relative z-50  hidden h-13 items-center justify-between px-5 pt-3 desktop:flex max-w-7xl ">
      <Link href="/" className="flex items-center text-text-primary">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary text-sm font-bold text-white">
          C
        </span>
        <span className="ml-2 text-lg font-bold text-white">ChadWallet</span>
      </Link>
      <div className="flex items-center gap-2">
        <a
          href="https://apps.apple.com/us/app/chadwallet/id6757367474"
          aria-label="Download on the App Store"
          className="rounded-md bg-white/20 backdrop-blur-md transition-all hover:opacity-90 hover:ring-1 hover:ring-white/40 hover:backdrop-blur-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
            <rect width="120" height="40" rx="6" fill="white" fillOpacity="0.15" />
          </svg>
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
          aria-label="Get it on Google Play"
          className="rounded-md bg-white/20 backdrop-blur-md transition-all hover:opacity-90 hover:ring-1 hover:ring-white/40 hover:backdrop-blur-sm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="135" height="40" viewBox="0 0 135 40" fill="none">
            <rect width="135" height="40" rx="6" fill="white" fillOpacity="0.15" />
          </svg>
        </a>
        {/* <WalletButton /> */}
      </div>
    </header>
  );
}
