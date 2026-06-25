"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TokenList from "@/components/trade/TokenList";
import TokenChart from "@/components/trade/TokenChart";
import TradePanel from "@/components/trade/TradePanel";

const DEFAULT_TOKEN = "So11111111111111111111111111111111111111112";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  price: number;
  priceChange24h: number;
}

function TradeContentInner() {
  const searchParams = useSearchParams();
  const tokenAddress = searchParams.get("token") || DEFAULT_TOKEN;
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/codex/tokens/${tokenAddress}`)
      .then((r) => r.json())
      .then((data) => {
        const d = data.data || data;
        if (d && d.address) {
          setTokenData(d);
        } else {
          setTokenData({
            address: tokenAddress,
            name: "Solana",
            symbol: "SOL",
            price: 0,
            priceChange24h: 0,
          });
        }
      })
      .catch(() => {
        setTokenData({
          address: tokenAddress,
          name: "Solana",
          symbol: "SOL",
          price: 0,
          priceChange24h: 0,
        });
      })
      .finally(() => setLoading(false));
  }, [tokenAddress]);

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
        <div className="h-[600px] animate-pulse rounded-2xl bg-zinc-900" />
        <div className="h-[600px] animate-pulse rounded-2xl bg-zinc-900" />
        <div className="h-[600px] animate-pulse rounded-2xl bg-zinc-900" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
      <div className="hidden lg:block">
        <TokenList />
      </div>

      <div>
        {tokenData && (
          <TokenChart
            tokenAddress={tokenData.address}
            tokenName={tokenData.name}
            tokenSymbol={tokenData.symbol}
            tokenLogo={tokenData.logoUrl}
            price={tokenData.price}
            priceChange24h={tokenData.priceChange24h}
          />
        )}
      </div>

      <div>
        <TradePanel tokenAddress={tokenAddress} />
      </div>
    </div>
  );
}

export default function TradeContent() {
  return (
    <Suspense fallback={null}>
      <TradeContentInner />
    </Suspense>
  );
}
