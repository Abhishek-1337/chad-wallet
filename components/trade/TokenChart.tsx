"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, ColorType } from "lightweight-charts";
import HoldersList from "./HoldersList";
import LiveTrades from "./LiveTrades";
import TokenAbout from "./TokenAbout";
import type { TokenStats } from "@/lib/codex";

interface TokenChartProps {
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  price: number;
  priceChange24h: number;
  tokenStats?: TokenStats | null;
  fullTokenData?: {
    description?: string;
    totalSupply?: string;
    circulatingSupply?: string;
    decimals?: number;
    top10HoldersPercent?: number;
    creatorAddress?: string;
    createdAt?: number;
    socialLinks?: { twitter?: string; telegram?: string; discord?: string; website?: string };
    launchpad?: { launchpadName?: string; graduationPercent?: number; completed?: boolean; migrated?: boolean; category?: string };
    mintable?: string;
    freezable?: string;
  };
}

type Tab = "chart" | "holders" | "trades" | "about";
type Timeframe = "1H" | "4H" | "1D" | "1W" | "1M";

function formatCompact(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatPrice(value: number): string {
  if (value >= 1) return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (value >= 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(8)}`;
}

const TIMEFRAME_CONFIG: Record<Timeframe, { interval: string; limit: number }> = {
  "1H": { interval: "1m", limit: 60 },
  "4H": { interval: "5m", limit: 48 },
  "1D": { interval: "15m", limit: 96 },
  "1W": { interval: "1h", limit: 168 },
  "1M": { interval: "4h", limit: 180 },
};

function TokenChart({
  tokenAddress,
  tokenName,
  tokenSymbol,
  tokenLogo,
  price,
  priceChange24h,
  tokenStats,
  fullTokenData,
}: TokenChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("chart");
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const [polledPrice, setPolledPrice] = useState<number | null>(null);

  // Poll live price every 10s; resets on token change via the effect cleanup + re-run
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const { getTokenPrice } = await import("@/lib/codex");
        const data = await getTokenPrice(tokenAddress);
        if (!cancelled) setPolledPrice(data.price || null);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [tokenAddress]);

  const livePrice = polledPrice ?? price;

  // Create chart once on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: { mode: 0 },
      timeScale: { borderColor: "#27272a", timeVisible: true },
      rightPriceScale: { borderColor: "#27272a" },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Fetch data when token or timeframe changes + poll every 30s
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    let cancelled = false;
    const { interval, limit } = TIMEFRAME_CONFIG[timeframe];

    const fetchOHLCV = async () => {
      try {
        const { getTokenOHLCV } = await import("@/lib/codex");
        const raw = await getTokenOHLCV(tokenAddress, interval, limit);
        if (cancelled) return;
        if (Array.isArray(raw)) {
          const formatted: CandlestickData[] = raw.map((d: any) => ({
            time: (d.timestamp || d.time) as any,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));
          series.setData(formatted);
        }
      } catch {}
    };

    fetchOHLCV();
    const intervalId = setInterval(fetchOHLCV, 30000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [tokenAddress, timeframe]);

  useEffect(() => {
    if (activeTab === "chart" && chartRef.current && chartContainerRef.current) {
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    }
  }, [activeTab]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        {tokenLogo && (
          <img src={tokenLogo} alt="" className="h-10 w-10 rounded-full" />
        )}
    <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{tokenSymbol || "SOL"}</h2>
            <span className="text-sm text-zinc-400">{tokenName || "Solana"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              ${livePrice?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 text-sm font-medium ${
                (priceChange24h || 0) >= 0
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {(priceChange24h || 0) >= 0 ? "+" : ""}
              {priceChange24h?.toFixed(2)}%
            </span>
          </div>
        </div>
        {tokenStats && (
        <div className="relative mb-4 flex-1 min-w-0">
          <div className="no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab">
            <div className="flex w-full">
              <div className="ml-auto">
                <div className="flex w-max shrink-0 items-center gap-2 tabular-nums">
                  <div className="flex flex-col items-center w-26 cursor-default py-2">
                    <span className="text-xs text-zinc-500">Market cap</span>
                    <span className="text-lg font-medium leading-tight text-white">{formatCompact(tokenStats.marketCap)}</span>
                  </div>
                  <InfoCard label="Price" value={formatPrice(tokenStats.price)} />
                  <InfoCard
                    label="24H change"
                    value={
                      <span className={`flex items-center gap-0.5 ${tokenStats.priceChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        <span className="text-[8px]">{tokenStats.priceChange24h >= 0 ? "▲" : "▼"}</span>
                        <span className="text-sm font-medium">{Math.abs(tokenStats.priceChange24h).toFixed(2)}%</span>
                      </span>
                    }
                  />
                  <InfoCard label="24H Vol." value={formatCompact(tokenStats.volume24h)} />
                  <InfoCard label="Liquidity" value={formatCompact(tokenStats.liquidity)} />
                  <InfoCard label="Holders" value={tokenStats.holders.toLocaleString()} />
                  <InfoCard label="Top 10 holding" value={`${tokenStats.top10HoldersPercent.toFixed(2)}%`} />
                </div>
              </div>
              <div className="w-4 shrink-0" aria-hidden="true" />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l to-transparent from-zinc-950" />
        </div>
      )}
      </div>

      

      <div className={activeTab !== "chart" ? "hidden" : ""}>
        <div ref={chartContainerRef} className="mb-4" />
        <div className="mb-4 flex gap-1">
          {(["1H", "4H", "1D", "1W", "1M"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                timeframe === tf
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-900 p-1">
        {(["chart", "holders", "trades", "about"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#8B5CF6] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab === "chart" ? "Price" : tab === "holders" ? "Holders" : tab === "trades" ? "Trades" : "About"}
          </button>
        ))}
      </div>

      {activeTab === "holders" && <HoldersList tokenAddress={tokenAddress} />}
      {activeTab === "trades" && <LiveTrades tokenAddress={tokenAddress} />}
      {activeTab === "about" && (
        <div className="mt-4">
          <TokenAbout tokenAddress={tokenAddress} token={fullTokenData} />
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col items-center rounded-lg bg-zinc-900 min-w-22 px-2 py-1.5">
      <span className="text-xs text-zinc-500 whitespace-nowrap">{label}</span>
      <div className="text-sm whitespace-nowrap min-h-5 flex items-center tabular-nums text-white">
        {value}
      </div>
    </div>
  );
}

export default memo(TokenChart);
