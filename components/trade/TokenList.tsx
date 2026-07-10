"use client";

import { memo, useEffect, useRef, useState } from "react";

import { getTrendingTokens, getTokenPrices, type CodexToken } from "@/lib/codex";

function formatPrice(price: number): string {
  const p = Number(price) || 0;
  if (p >= 1) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (p >= 0.01) return `$${p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
  return `$${p.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

const CATEGORIES = ["Watchlist", "Crypto", "Trending", "Most held", "Graduated", "Bonding"] as const;
type Category = (typeof CATEGORIES)[number];

const DISCOVERY_TABS = ["Alerts", "Tokens", "Leaderboard", "Feed"] as const;
type DiscoveryTab = (typeof DISCOVERY_TABS)[number];

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
  const [category, setCategory] = useState<Category>("Trending");
  const [discovery, setDiscovery] = useState<DiscoveryTab>("Tokens");
  const [collapsed, setCollapsed] = useState(false);
  const initialPrices = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getTrendingTokens()
      .then((list) => {
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : [];
        setTokens(arr);
        const snapshot = new Map<string, number>();
        arr.forEach((t) => snapshot.set(t.address, t.price));
        initialPrices.current = snapshot;
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [category]);

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
    <div className="flex h-screen w-60 2xl:w-85 flex-col border-r-2 border-slate-800">
      <div className="flex shrink-0 items-center rounded-t-xl bg-bg-secondary pl-3">
        <div className="relative min-w-0 flex-1">
          <div className="no-scrollbar flex cursor-grab items-center gap-2 overflow-x-auto overflow-y-hidden text-sm font-medium">
            <button
              onClick={() => setDiscovery("Alerts")}
              className={`flex shrink-0 items-center justify-start gap-1 whitespace-nowrap text-left hover:text-text-primary ${
                discovery === "Alerts" ? "" : "text-text-secondary"
              }`}
            >
              <span className="relative flex shrink-0 items-center justify-center">
                <svg width="14" height="14"><use href="/images/sprite.svg#bell-filled" /></svg>
                <span className="invisible absolute -right-0.5 -top-0.5 size-2 rounded-full border border-bg-secondary bg-red" aria-hidden="true" />
              </span>
              <span>Alerts</span>
            </button>
            <div className="h-4 w-px bg-bg-tertiary/40" aria-hidden="true" />
            <button
              onClick={() => setDiscovery("Tokens")}
              className={`flex shrink-0 whitespace-nowrap text-left hover:text-text-primary focus:text-text-primary focus:outline-none ${
                discovery === "Tokens" ? "" : "text-text-secondary"
              }`}
            >
              Tokens
            </button>
            <div className="h-4 w-px bg-bg-tertiary/40" aria-hidden="true" />
            <button
              onClick={() => setDiscovery("Leaderboard")}
              className={`flex shrink-0 whitespace-nowrap text-left hover:text-text-primary ${
                discovery === "Leaderboard" ? "" : "text-text-secondary"
              }`}
            >
              Leaderboard
            </button>
            <div className="h-4 w-px bg-bg-tertiary/40" aria-hidden="true" />
            <button
              onClick={() => setDiscovery("Feed")}
              className={`flex shrink-0 whitespace-nowrap text-left hover:text-text-primary ${
                discovery === "Feed" ? "" : "text-text-secondary"
              }`}
            >
              Feed
            </button>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-bg-secondary to-transparent" />
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Collapse discovery panel"
          className="ml-auto flex shrink-0 items-center gap-1 p-1 text-text-tertiary hover:text-text-primary focus:outline-none"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
            <path d="M7.25609 11.911C7.58193 12.2369 7.58193 12.7636 7.25609 13.0894C7.09359 13.2519 6.88023 13.3336 6.6669 13.3336C6.45357 13.3336 6.24021 13.2519 6.07771 13.0894L0.244375 7.25609C-0.0814583 6.93026 -0.0814583 6.40354 0.244375 6.07771L6.07771 0.244375C6.40354 -0.0814583 6.93026 -0.0814583 7.25609 0.244375C7.58193 0.570208 7.58193 1.09693 7.25609 1.42276L2.01195 6.6669L7.25609 11.911ZM7.84529 6.6669L13.0894 1.42276C13.4153 1.09693 13.4153 0.570208 13.0894 0.244375C12.7636 -0.0814583 12.2369 -0.0814583 11.911 0.244375L6.07771 6.07771C5.75187 6.40354 5.75187 6.93026 6.07771 7.25609L11.911 13.0894C12.0735 13.2519 12.2869 13.3336 12.5002 13.3336C12.7136 13.3336 12.9269 13.2519 13.0894 13.0894C13.4153 12.7636 13.4153 12.2369 13.0894 11.911L7.84529 6.6669Z" fill="currentColor"></path>
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="relative shrink-0">
        <div className="no-scrollbar flex cursor-grab gap-2 overflow-x-auto overflow-y-hidden whitespace-nowrap pb-1 pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-[#161522] px-1.5 text-xs font-bold leading-none focus:bg-[#161522] focus:outline-none ${
                category === cat
                  ? "bg-bg-tertiary-solid"
                  : "text-text-secondary hover:bg-bg-tertiary-solid"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-bg-primary to-transparent" />
      </div>
      )}

      {!collapsed && (
        loading ? (
        <div className="space-y-3 p-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-zinc-900" />
          ))}
        </div>
      ) : (
        <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto">
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-800 text-xs font-bold text-white">
                  {token.symbol?.slice(0, 2)}
                </div>
              )}
              <div className="flex flex-1 min-w-0 flex-col gap-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-sm leading-4">{token.name}</span>
                </div>
                <div className="text-xs text-white">{formatPrice(token.price)}</div>
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
      ))}
    </div>
  );
}

export default memo(TokenList);
