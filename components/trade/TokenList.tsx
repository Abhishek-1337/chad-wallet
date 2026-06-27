"use client";

import { memo, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { getTrendingTokens, type CodexToken } from "@/lib/codex";

function formatPrice(price: number): string {
  if (price >= 1) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 0.01) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
}

function TokenList({
  activeToken,
  setToken,
}: {
  activeToken: string;
  setToken: (addr: string) => void;
}) {
  const [tokens, setTokens] = useState<CodexToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getTrendingTokens()
      .then((list) => setTokens(Array.isArray(list) ? list : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tokens.filter(
    (t) =>
      t.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-900" />
        ))}
      </div>
    );
  }

  return (
    <div className="border-r-2 border-slate-800 h-screen">
      <div className="relative mb-4 px-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
        <input
          type="text"
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-zinc-700"
        />
      </div>

      <div className="space-y-1 h-full overflow-y-auto">
        {filtered.map((token, i) => (
          <button
            key={token.address}
            onClick={() => {
              setToken(token.address);
              // router.push(`/trade?token=${token.address}`);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
              activeToken === token.address
                ? "bg-[#8B5CF6]/10"
                : "hover:bg-zinc-900"
            }`}
          >
            {/* <span className="w-5 text-xs text-zinc-600">{i + 1}</span> */}
            {token.logoUrl ? (
              <img src={token.logoUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
                {token.symbol?.slice(0, 2)}
              </div>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{token.symbol}</div>
              <div className="text-xs text-zinc-500">{token.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white">
                {formatPrice(token.price)}
              </div>
              <div
                className={`text-xs ${
                  (token.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {(token.priceChange24h || 0) >= 0 ? "+" : ""}
                {token.priceChange24h?.toFixed(2)}%
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(TokenList);