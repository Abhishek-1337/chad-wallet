"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useRef, useState } from "react";

function AvatarIcon({ address }: { address: string }) {
  const hash = address
    ? address.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    : 0;
  const hue = hash % 360;
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-bg-tertiary"
      style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
}

export default function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  if (!ready) {
    return <div className="h-9 w-9 animate-pulse rounded-full bg-bg-tertiary" />;
  }

  if (authenticated && user) {
    const wallet = user.wallet?.address;

    return (
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-bg-secondary"
        >
          <AvatarIcon address={wallet ?? ""} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-bg-tertiary bg-bg-primary py-1 shadow-xl">
            <div className="border-b border-bg-tertiary px-3 py-2 text-xs text-text-secondary">
              {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connected"}
            </div>
            <button
              onClick={logout}
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
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        sessionStorage.setItem("redirectAfterLogin", "1");
        await login();
        window.location.href = "/trade";
      }}
      className="h-10 rounded-lg bg-bg-secondary px-5 font-bold text-text-primary ring ring-bg-tertiary transition-colors hover:bg-bg-secondary/80"
    >
      Login
    </button>
  );
}
