"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated && !sessionStorage.getItem("redirectAfterLogin")) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#8B5CF6] border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
        <img src="/logo/dark.png" alt="ChadWallet" className="h-12 w-auto" />
        <h1 className="text-2xl font-bold text-white">You need to log in</h1>
        <p className="max-w-sm text-zinc-400">
          Connect your wallet to access the trading dashboard.
        </p>
        <button
          onClick={() => {
            sessionStorage.setItem("redirectAfterLogin", "1");
            login();
          }}
          className="rounded-lg bg-[#8B5CF6] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#7C3AED]"
        >
          Login with Google or Apple
        </button>
        <button
          onClick={() => router.push("/")}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← Back to home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
