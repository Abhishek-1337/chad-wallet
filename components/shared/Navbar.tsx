"use client";

import Link from "next/link";
import WalletButton from "./WalletButton";
import { AppleLogo } from "../logo/AppleLogo";
import { GooglePlayLogo } from "../logo/GooglePlayLogo";

export default function Navbar({ showDownload = true }: { showDownload?: boolean }) {
  return (
    <header className="relative z-50 hidden h-13 items-center justify-between px-5 pt-3 desktop:flex max-w-full">
      <Link href="/" className="flex items-center text-text-primary">
        <img src="/logo/dark.png" alt="ChadWallet" className="h-8 w-auto" />
        <span className="ml-2 text-lg font-bold text-white">ChadWallet</span>
      </Link>
      <div className="flex items-center gap-2">
        {showDownload && (
          <>
            <a
              href="https://apps.apple.com/us/app/chadwallet/id6757367474"
              aria-label="Download on the App Store"
              className="flex items-center gap-1 rounded-md bg-white/20 backdrop-blur-md transition-all hover:opacity-90 hover:ring-1 hover:ring-white/40 hover:backdrop-blur-sm p-[0.4rem] px-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <AppleLogo size={25} />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-wide">Download on the </span>
                <span className="text-md leading-none font-semibold">App Store</span>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
              aria-label="Download on the App Store"
              className="flex items-center gap-1 rounded-md bg-white/20 backdrop-blur-md transition-all hover:opacity-90 hover:ring-1 hover:ring-white/40 hover:backdrop-blur-sm p-[0.4rem] px-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GooglePlayLogo size={25} />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold tracking-wide">Get it on </span>
                <span className="text-md leading-none font-semibold">Google Play</span>
              </div>
            </a>
          </>
        )}
        <WalletButton />
      </div>
    </header>
  );
}
