"use client";

import { useEffect, useState } from "react";

interface Trade {
  walletAddress: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  timestamp: string;
  signature: string;
}

export default function LiveTrades({ tokenAddress }: { tokenAddress: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTrades = async () => {
      try {
        const { getTokenSwaps } = await import("@/lib/codex");
        const list = await getTokenSwaps(tokenAddress, 20);
        if (cancelled) return;
        setTrades(Array.isArray(list) ? list : []);
        setError(null);
      } catch (e) {
        if (!cancelled) setError("Failed to load trades");
        console.error("[LiveTrades] error:", e);
      }
      if (!cancelled) setLoading(false);
    };

    fetchTrades();
    const interval = setInterval(fetchTrades, 600000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="mt-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-lg bg-zinc-900" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 text-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="mt-8 text-center text-sm text-zinc-500">
        No recent trades
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-zinc-500">
        <span>Wallet</span>
        <span>Type</span>
        <span>Amount</span>
        <span>Time</span>
      </div>
      <div className="space-y-1">
        {trades.map((trade, i) => (
          <div
            key={`${trade.signature}-${i}`}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-zinc-900"
          >
            <span className="font-mono text-xs text-zinc-300">
              {trade.walletAddress?.slice(0, 4)}...{trade.walletAddress?.slice(-4)}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${
                trade.type === "buy"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {trade.type === "buy" ? "BUY" : "SELL"}
            </span>
            <span className="text-xs text-zinc-400">
              {trade.amount?.toFixed(4)}
            </span>
            <span className="text-xs text-zinc-500">
              {trade.timestamp
                ? new Date(trade.timestamp).toLocaleTimeString()
                : "---"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
