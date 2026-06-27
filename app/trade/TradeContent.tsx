"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
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

const FALLBACK: TokenData = {
  address: DEFAULT_TOKEN,
  name: "Solana",
  symbol: "SOL",
  price: 0,
  priceChange24h: 0,
};

function TradeContentInner() {
  const [tokenAddress, setTokenAddress] = useState<string>(DEFAULT_TOKEN);
  const [tokenData, setTokenData] = useState<TokenData>(FALLBACK);

  const handleSetToken = useCallback((addr: string) => {
    setTokenAddress(addr);
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/codex/token?address=${tokenAddress}`)
      .then((r) => r.json())
      .then((token) => {
        if (cancelled) return;
        if (token && token.address) {
          setTokenData({
            address: token.address,
            name: token.name || "",
            symbol: token.symbol || "",
            logoUrl: token.info?.imageThumbUrl || token.info?.imageSmallUrl || undefined,
            price: 0,
            priceChange24h: 0,
          });
        } else {
          setTokenData({ ...FALLBACK, address: tokenAddress });
        }
      })
      .catch(() => {
        if (!cancelled) setTokenData({ ...FALLBACK, address: tokenAddress });
      });

    return () => { cancelled = true; };
  }, [tokenAddress]);

  return (
    <div className="grid gap-2 lg:grid-cols-4">
      <div className="hidden lg:block">
        <TokenList
          activeToken={tokenAddress}
          setToken={handleSetToken}
        />
      </div>

      <div className="col-span-2">
        <TokenChart
          tokenAddress={tokenData.address}
          tokenName={tokenData.name}
          tokenSymbol={tokenData.symbol}
          tokenLogo={tokenData.logoUrl}
          price={tokenData.price}
          priceChange24h={tokenData.priceChange24h}
        />
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
