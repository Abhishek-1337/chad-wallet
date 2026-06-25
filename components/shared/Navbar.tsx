"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import WalletButton from "./WalletButton";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-800/50 bg-[#0A0A0B]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6] text-sm font-bold text-white">
            C
          </div>
          <span className="text-lg font-bold text-white">ChadWallet</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/trade"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Trade
          </Link>
          <Link
            href="/trade"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Markets
          </Link>
          <WalletButton />
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-zinc-400 md:hidden"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-800/50 bg-[#0A0A0B] px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-3 pt-4">
            <Link
              href="/trade"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              onClick={() => setOpen(false)}
            >
              Trade
            </Link>
            <Link
              href="/trade"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
              onClick={() => setOpen(false)}
            >
              Markets
            </Link>
            <WalletButton />
          </div>
        </div>
      )}
    </nav>
  );
}
