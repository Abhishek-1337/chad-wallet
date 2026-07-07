"use client";

import { memo, useEffect, useRef, useState } from "react";

import { getTrendingTokens, getTokenPrices, type CodexToken } from "@/lib/codex";

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function TokenList({
  activeToken,
  setToken,
  search,
}: {
  activeToken: string;
  setToken: (addr: string) => void;
  search: string;
}) {
  const [tokens, setTokens] = useState<CodexToken[]>([]);
  const [loading, setLoading] = useState(true);
  const initialPrices = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    getTrendingTokens()
      .then((list) => {
        const arr = Array.isArray(list) ? list : [];
        setTokens(arr);
        // Snapshot initial prices for PnL calculation
        const snapshot = new Map<string, number>();
        arr.forEach((t) => snapshot.set(t.address, t.price));
        initialPrices.current = snapshot;
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Poll live prices every 10s
  useEffect(() => {
    if (tokens.length === 0) return;

    const poll = async () => {
      try {
        const addresses = tokens.map((t) => t.address);
        const prices = await getTokenPrices(addresses);
        setTokens((prev) =>
          prev.map((t) => {
            const newPrice = prices.get(t.address);
            if (newPrice !== undefined) {
              const initial = initialPrices.current.get(t.address) || t.price;
              const priceChange = initial > 0 ? ((newPrice - initial) / initial) * 100 : 0;
              return { ...t, price: newPrice, priceChange24h: priceChange };
            }
            return t;
          })
        );
      } catch {}
    };

    poll();
    const interval = setInterval(poll, 600000);
    return () => clearInterval(interval);
  }, [tokens.length]);

  const filtered = tokens.filter(
    (t) =>
      t.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      t.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="border-r-2 border-slate-800 h-screen min-w-xs">
      {loading ? (
        <div className="space-y-3 p-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-1 h-full overflow-y-auto">
            {filtered.map((token) => (
              <button
                key={token.address}
                onClick={() => setToken(token.address)}
                className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
                  activeToken === token.address
                    ? "bg-[#8B5CF6]/10"
                    : "hover:bg-zinc-900"
                }`}
              >
                {token.logoUrl ? (
                  <img src={token.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full border border-zinc-800" />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-800 text-xs font-bold text-zinc-400">
                    {token.symbol?.slice(0, 2)}
                  </div>
                )}
                <div className="flex flex-1 min-w-0 flex-col gap-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-sm leading-4">{token.name}</span>
                  </div>
                  <div className="text-xs text-zinc-500">{formatPrice(token.price)}</div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5 tabular-nums">
                  <div className="text-sm leading-4">
                    {token.marketCap ? formatCompact(token.marketCap) : "—"} MC
                  </div>
                  <div className="flex items-center gap-0.75" style={{ lineHeight: "16px" }}>
                    <span
                      className={`text-xs font-medium ${
                        (token.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {(token.priceChange24h || 0) >= 0 ? "▲" : "▼"}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        (token.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {Math.abs(token.priceChange24h || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default memo(TokenList);
