"use client";

import { useEffect, useState } from "react";

interface Holder {
  address: string;
  percentage: number;
  balance: string;
}

export default function HoldersList({ tokenAddress }: { tokenAddress: string }) {
  const [holders, setHolders] = useState<Holder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/codex")
      .then(({ getTokenHolders }) => getTokenHolders(tokenAddress))
      .then((list) => setHolders(Array.isArray(list) ? list.slice(0, 10) : []))
      .catch(() => {})
      .finally(() => setLoading(false));
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

  if (holders.length === 0) {
    return (
      <div className="mt-8 text-center text-sm text-zinc-500">
        No holder data available
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between px-1 text-xs text-zinc-500">
        <span>Address</span>
        <span>% Held</span>
      </div>
      <div className="space-y-1">
        {holders.map((h, i) => (
          <div
            key={h.address}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-zinc-900"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 text-xs text-zinc-600">{i + 1}</span>
              <span className="font-mono text-xs text-zinc-300">
                {h.address.slice(0, 4)}...{h.address.slice(-4)}
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              {h.percentage?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
