"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TradeNavbar from "@/components/trade/TradeNavbar";
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
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || DEFAULT_TOKEN;
  const [tokenAddress, setTokenAddress] = useState<string>(initialToken);
  const [tokenData, setTokenData] = useState<TokenData>(FALLBACK);
  const [fullTokenData, setFullTokenData] = useState<FullTokenData | null>(null);
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [search, setSearch] = useState("");

  const handleSetToken = useCallback((addr: string) => {
    setTokenAddress(addr);
    window.history.replaceState(null, "", `/trade?token=${addr}`);
  }, []);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl && tokenFromUrl !== tokenAddress) {
      setTokenAddress(tokenFromUrl);
    }
  }, [searchParams, tokenAddress]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`/api/codex/token?address=${tokenAddress}`).then((r) => r.json()),
      import("@/lib/codex").then(({ getTokenPrice }) => getTokenPrice(tokenAddress)),
      import("@/lib/codex").then(({ getTokenStats }) => getTokenStats(tokenAddress)),
    ])
      .then(([token, priceData, stats]) => {
        if (cancelled) return;
        console.log("[TradeContent] token:", token, "priceData:", priceData, "stats:", stats);
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
          setTokenStats(stats);
        } else {
          console.warn("[TradeContent] token data missing, using fallback");
          setTokenData({ ...FALLBACK, address: tokenAddress });
          setFullTokenData(null);
          setTokenStats(null);
        }
      })
      .catch((err) => {
        console.error("[TradeContent] fetch error:", err);
        if (!cancelled) {
          setTokenData({ ...FALLBACK, address: tokenAddress });
          setFullTokenData(null);
          setTokenStats(null);
        }
      });

    return () => { cancelled = true; };
  }, [tokenAddress]);

  return (
    <div className="flex min-h-svh flex-col gap-3">
      <div className="sticky top-0 z-50 flex items-center justify-center border-bg-tertiary bg-bg-primary px-3">
        <TradeNavbar search={search} setSearch={setSearch} />
      </div>
      <div className="flex flex-1 gap-2 min-h-0">
        <div className="lg:block">
          <TokenList
            activeToken={tokenAddress}
            setToken={handleSetToken}
            search={search}
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

          <div className="no-scrollbar lg:col-span-1 min-w-0 flex flex-col gap-6 overflow-y-auto" style={{ height: "calc(100vh - 3.25rem)" }}>
            <TradePanel tokenAddress={tokenAddress} tokenSymbol={tokenData.symbol} />
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
      <TradeContentInner />
    </Suspense>
  );
}
