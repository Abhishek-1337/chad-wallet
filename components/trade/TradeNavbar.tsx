"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

function AvatarIcon({ address }: { address: string }) {
  const hash = address
    ? address.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 0;
  const hue = hash % 360;
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
}

export default function TradeNavbar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  const { authenticated, user, login, logout } = usePrivy();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const walletAddress = user?.wallet?.address ?? "";

  return (
    <nav className="group/navigation-menu relative flex max-w-full flex-1 items-center justify-between h-[52px] font-semibold">
        <Link href="/" className="flex items-center text-text-primary">
          <img src="/logo/dark.png" alt="ChadWallet" className="h-8 w-auto" />
          <span className="ml-2 text-lg font-bold text-white">ChadWallet</span>
        </Link>
      <div className="flex h-12 items-center gap-2 rounded-xl border px-3 cursor-text border-[#cbd0eb1a] bg-bg-primary hover:bg-bg-secondary w-100 xl:w-160 ml-10">
        <div className="relative w-xl py-12">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#474b52]" size={16} />
          <input
            type="text"
            placeholder="Search tokens or traders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl py-2.5 pl-10 pr-4 text-sm font-normal text-[#f7f7f7] placeholder-zinc-500 outline-none transition-colors focus:border-zinc-700"
          />
        </div>
        </div>
      <div>
        <ul className="group flex-1 list-none justify-center flex gap-2 items-stretch" dir="ltr">
          <li className="relative flex shrink-0 flex-col items-start justify-center h-12 rounded-xl border border-bg-tertiary px-2">
            <button className="group inline-flex items-center justify-center outline-none disabled:pointer-events-none disabled:opacity-50 group focus:opacity-80 text-sm">
              <div className="flex gap-1 items-baseline tabular-nums">
                <span className="text-sm tabular-nums">$0.00</span>
                <div className="text-text-tertiary">cash</div>
              </div>
            </button>
            <button
              type="button"
              className="text-accent-primary text-xs font-bold hover:opacity-80"
            >
              Deposit more
            </button>
          </li>

          <li className="relative flex shrink-0 rounded-xl h-12 hover:bg-bg-secondary px-2 py-1 border border-bg-tertiary bg-bg-primary" suppressHydrationWarning>
            {authenticated && walletAddress ? (
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="group inline-flex items-center justify-center outline-none disabled:pointer-events-none disabled:opacity-50 group"
              >
                <div className="flex gap-2 items-center min-w-26">
                  <div className="flex flex-col flex-1 shrink-0 items-start justify-center">
                    <div className="text-sm tabular-nums text-left">$0.00</div>
                    <div className="flex gap-1 items-center tabular-nums">
                      <div className="flex items-center">
                        <div>--</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full flex items-center justify-center shrink-0">
                    <img
                      src="/fomo-eyes.png"
                      alt=""
                      className="w-[70%] h-[70%]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {!authenticated && (
                      <AvatarIcon address={walletAddress} />
                    )}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={() => {
                  sessionStorage.setItem("loginIntent", "1");
                  login();
                }}
                className="group inline-flex items-center justify-center outline-none disabled:pointer-events-none disabled:opacity-50 group"
              >
                <div className="flex gap-2 items-center justify-between min-w-26">
                  <div className="flex flex-col">
                    <div className="text-sm tabular-nums text-left">$0.00</div>
                    <span className="text-xs">--</span>
                  </div>
                  <div className="rounded-full flex items-center justify-center shrink-0 bg-bg-tertiary">
                    <AvatarIcon address="0x0000000000000000000000000000000000000000" />
                  </div>
                </div>
              </button>
            )}

            {menuOpen && authenticated && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-bg-tertiary bg-bg-primary py-1 shadow-xl z-50">
                <div className="border-b border-bg-tertiary px-3 py-2 text-xs text-text-secondary font-mono">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                    : "Connected"}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 100);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-bg-secondary"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
