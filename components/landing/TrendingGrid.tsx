"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CodexToken } from "@/lib/codex";

export default function TrendingGrid() {
  const [tokens, setTokens] = useState<CodexToken[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    import("@/lib/codex")
      .then(({ getTrendingTokens }) => getTrendingTokens())
      .then((list) => setTokens(Array.isArray(list) ? list.slice(0, 8) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-8">
          <h2 className="text-[60px] font-bold text-text-primary">Live Trending Tokens</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-bg-secondary" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl px-4 py-24 sm:px-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary">Live Trending Tokens</h2>
        <p className="mt-2 text-text-secondary">Top traded Solana tokens right now</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tokens.map((token) => (
          <button
            key={token.address}
            onClick={() => router.push(`/trade?token=${token.address}`)}
            className="group rounded-2xl border border-bg-tertiary bg-bg-secondary/50 p-5 text-left transition-all hover:border-white/20 hover:bg-bg-secondary"
          >
            <div className="mb-3 flex items-center gap-3">
              {token.logoUrl ? (
                <img src={token.logoUrl} alt="" className="h-10 w-10 rounded-full" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-tertiary text-sm font-bold text-text-tertiary">
                  {token.symbol?.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="font-semibold text-text-primary group-hover:text-accent-primary">
                  {token.symbol}
                </div>
                <div className="text-xs text-text-tertiary">{token.name}</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-text-primary">
                ${token.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                  (token.priceChange24h || 0) >= 0
                    ? "bg-green-500/10 text-[#22c55e]"
                    : "bg-red-500/10 text-[#ef4444]"
                }`}
              >
                {(token.priceChange24h || 0) >= 0 ? "+" : ""}
                {token.priceChange24h?.toFixed(2)}%
              </span>
            </div>

            {token.volume24h && (
              <div className="mt-2 text-xs text-text-tertiary">
                Vol: ${(token.volume24h / 1000).toFixed(0)}K
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
