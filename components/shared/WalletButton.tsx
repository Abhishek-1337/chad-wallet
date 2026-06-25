"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="h-10 w-28 animate-pulse rounded-full bg-zinc-800" />
    );
  }

  if (authenticated && user) {
    const wallet = user.wallet?.address;
    const display = wallet
      ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
      : "Connected";

    return (
      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
        {display}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="rounded-full bg-[#8B5CF6] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#7C3AED]"
    >
      Sign In
    </button>
  );
}
