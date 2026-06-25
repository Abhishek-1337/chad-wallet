"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function WalletButton() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return <div className="h-10 w-20 animate-pulse rounded-lg bg-bg-tertiary" />;
  }

  if (authenticated && user) {
    const wallet = user.wallet?.address;
    const display = wallet
      ? `${wallet.slice(0, 4)}...${wallet.slice(-4)}`
      : "Connected";

    return (
      <button
        onClick={logout}
        className="h-10 rounded-lg bg-bg-secondary px-5 font-bold text-text-primary ring ring-bg-tertiary transition-colors hover:bg-bg-secondary/80"
      >
        {display}
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="h-10 rounded-lg bg-bg-secondary px-5 font-bold text-text-primary ring ring-bg-tertiary transition-colors hover:bg-bg-secondary/80"
    >
      Login
    </button>
  );
}
