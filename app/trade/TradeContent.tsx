"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Navbar from "@/components/shared/Navbar";
import AuthGuard from "@/components/shared/AuthGuard";
import TokenList from "@/components/trade/TokenList";
import TokenChart from "@/components/trade/TokenChart";
import TradePanel from "@/components/trade/TradePanel";
import TokenAbout from "@/components/trade/TokenAbout";
import type { TokenStats } from "@/lib/codex";

const DEFAULT_TOKEN = "So11111111111111111111111111111111111111112";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  price: number;
  priceChange24h: number;
}

interface FullTokenData {
  address?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  description?: string;
  totalSupply?: string;
  circulatingSupply?: string;
  top10HoldersPercent?: number;
  creatorAddress?: string;
  createdAt?: number;
  socialLinks?: { twitter?: string; telegram?: string; discord?: string; website?: string };
  launchpad?: { launchpadName?: string; graduationPercent?: number; completed?: boolean; migrated?: boolean; category?: string };
  mintable?: string;
  freezable?: string;
  info?: { imageThumbUrl?: string; imageSmallUrl?: string; description?: string; totalSupply?: string; circulatingSupply?: string };
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
  const [fullTokenData, setFullTokenData] = useState<FullTokenData | null>(null);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);

  const handleSetToken = useCallback((addr: string) => {
    setTokenAddress(addr);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`/api/codex/token?address=${tokenAddress}`).then((r) => r.json()),
      import("@/lib/codex").then(({ getTokenPrice }) => getTokenPrice(tokenAddress)),
      import("@/lib/codex").then(({ getTokenStats }) => getTokenStats(tokenAddress)),
    ])
      .then(([token, priceData, stats]) => {
        if (cancelled) return;
        if (token && token.address) {
          setTokenData({
            address: token.address,
            name: token.name || "",
            symbol: token.symbol || "",
            logoUrl: token.info?.imageThumbUrl || token.info?.imageSmallUrl || undefined,
            price: priceData.price,
            priceChange24h: priceData.priceChange24h,
          });
          setFullTokenData({
            address: token.address,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            description: token.info?.description,
            totalSupply: token.info?.totalSupply,
            circulatingSupply: token.info?.circulatingSupply,
            top10HoldersPercent: token.top10HoldersPercent,
            creatorAddress: token.creatorAddress,
            createdAt: token.createdAt,
            socialLinks: token.socialLinks,
            launchpad: token.launchpad,
            mintable: token.mintable,
            freezable: token.freezable,
            info: token.info,
          });
          console.log(stats);
          setTokenStats(stats);
        } else {
          setTokenData({ ...FALLBACK, address: tokenAddress });
          setFullTokenData(null);
          setTokenStats(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTokenData({ ...FALLBACK, address: tokenAddress });
          setFullTokenData(null);
          setTokenStats(null);
        }
      });

    return () => { cancelled = true; };
  }, [tokenAddress]);

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar showDownload={false} />
      {/* <div className="grid gap-2 lg:grid-cols-4 flex-1 p-2 pt-16"> */}
      <div className="flex p-2 pt-16 min-h-0">
        <div className="lg:block">
          <TokenList
            activeToken={tokenAddress}
            setToken={handleSetToken}
          />
        </div>

        <div className="min-w-0 flex-1 grid lg:grid-cols-4 gap-2">
          <div className="lg:col-span-3 min-w-0">
            <TokenChart
              key={tokenData.address}
              tokenAddress={tokenData.address}
              tokenName={tokenData.name}
              tokenSymbol={tokenData.symbol}
              tokenLogo={tokenData.logoUrl}
              price={tokenData.price}
              priceChange24h={tokenData.priceChange24h}
              tokenStats={tokenStats}
              fullTokenData={fullTokenData || undefined}
            />
          </div>

          <div className="lg:col-span-1 min-w-0 flex flex-col gap-6 overflow-y-auto" style={{ height: "calc(100vh - 3.25rem)" }}>
            <TradePanel tokenAddress={tokenAddress} />
            {fullTokenData && <TokenAbout tokenAddress={tokenAddress} token={fullTokenData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TradeContent() {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <TradeContentInner />
      </AuthGuard>
    </Suspense>
  );
}
