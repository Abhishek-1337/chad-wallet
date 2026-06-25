"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { CodexToken } from "@/lib/codex";

interface TokenBannerProps {
  direction: "left" | "right";
}

export default function TokenBanner({ direction }: TokenBannerProps) {
  const [tokens, setTokens] = useState<CodexToken[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/codex/tokens/trending?networkId=1399811149")
      .then((r) => r.json())
      .then((data) => {
        const list = data.data || data.tokens || data;
        setTokens(Array.isArray(list) ? list.slice(0, 20) : []);
      })
      .catch(() => {});
  }, []);

  if (tokens.length === 0) return null;

  const items = [...tokens, ...tokens];

  return (
    <div className="overflow-hidden py-3">
      <div
        className={`flex gap-8 ${
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        }`}
        style={{ width: "fit-content" }}
      >
        {items.map((token, i) => (
          <button
            key={`${token.address}-${i}`}
            onClick={() => router.push(`/trade?token=${token.address}`)}
            className="flex shrink-0 items-center gap-3 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 transition-colors hover:border-zinc-700"
          >
            {token.logoUrl && (
              <img
                src={token.logoUrl}
                alt=""
                className="h-6 w-6 rounded-full"
              />
            )}
            <span className="text-sm font-medium text-zinc-300">
              {token.symbol}
            </span>
            <span className="text-sm text-zinc-400">
              ${token.price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </span>
            <span
              className={`text-xs font-medium ${
                (token.priceChange24h || 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {(token.priceChange24h || 0) >= 0 ? "+" : ""}
              {token.priceChange24h?.toFixed(2)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
