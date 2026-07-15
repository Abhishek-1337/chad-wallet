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
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard?.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const num = (v: unknown): number => {
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : 0;
  };

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
        console.log(`[TokenChart] OHLCV data for ${tokenAddress}:`, raw?.length, "bars");
        if (Array.isArray(raw) && raw.length > 0) {
          const formatted: CandlestickData[] = raw.map((d: any) => ({
            time: (d.timestamp || d.time) as any,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));
          series.setData(formatted);
        } else {
          console.warn("[TokenChart] No OHLCV data received");
        }
      } catch (e) {
        console.error("[TokenChart] OHLCV fetch error:", e);
      }
    };

    fetchOHLCV();
    const intervalId = setInterval(fetchOHLCV, 600000);

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
        <div className="flex gap-3 items-center w-full">
          <button type="button" aria-label="View token image">
            <div className="relative shrink-0" style={{ width: 40, height: 40 }}>
              {tokenLogo && (
                <img
                  className="rounded-full border border-bg-tertiary"
                  src={tokenLogo}
                  style={{ height: 40, width: 40 }}
                  alt=""
                />
              )}
              <div
                className="absolute flex items-center justify-center"
                style={{ bottom: -4, right: -4 }}
              >
                <svg style={{ width: 18, height: 18 }}>
                  <use href="/images/sprite.svg#badge-check" />
                </svg>
              </div>
            </div>
          </button>
          <div className="flex flex-col gap-1 w-52 shrink-0">
            <div className="flex gap-1 items-center">
              <div className="text-base leading-tight" translate="no">
                {tokenSymbol || "SOL"}
              </div>
              <svg
                width="20"
                height="20"
                className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
              >
                <use href="/images/sprite.svg#robinhood-logo" />
              </svg>
              <div className="w-px h-4 bg-bg-tertiary mx-0.5" />
              <div className="flex gap-1 items-center">
                {fullTokenData?.socialLinks?.website && (
                  <a
                    href={fullTokenData.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16">
                      <use href="/images/sprite.svg#globe" />
                    </svg>
                  </a>
                )}
                {fullTokenData?.socialLinks?.twitter && (
                  <a
                    href={fullTokenData.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16">
                      <use href="/images/sprite.svg#twitter-logo" />
                    </svg>
                  </a>
                )}
                {fullTokenData?.socialLinks?.telegram && (
                  <a
                    href={fullTokenData.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16">
                      <use href="/images/sprite.svg#telegram" />
                    </svg>
                  </a>
                )}
                <a
                  href={`https://x.com/search?q=${encodeURIComponent(
                    tokenAddress + " OR $" + (tokenSymbol || "")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search"
                    aria-hidden="true"
                  >
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                  </svg>
                </a>
              </div>
              <button onClick={copyAddress}>
                <svg className="size-4 text-text-tertiary">
                  <use href="/images/sprite.svg#star-empty" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <div
                className="text-xs text-text-secondary truncate max-w-32"
                translate="no"
              >
                {tokenName}
              </div>
              <div className="w-px h-3 bg-bg-tertiary" />
              <button
                type="button"
                className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                aria-label="Copy address"
                onClick={copyAddress}
              >
                <div className="text-text-tertiary text-xs">
                  {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-6)}
                </div>
                <div className="w-4 h-4 shrink-0 relative flex items-center justify-center">
                  {!copied ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-copy w-4 h-4 text-text-tertiary absolute transition-all duration-200 opacity-100 scale-100 rotate-0"
                      aria-hidden="true"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-circle-check w-4 h-4 text-green absolute transition-all duration-200 opacity-100 scale-100 rotate-0"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="m9 12 2 2 4-4"></path>
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
          {tokenStats && (
            <div className="relative ml-auto flex-1 min-w-0">
              <div className="no-scrollbar overflow-x-auto overflow-y-hidden cursor-grab">
                <div className="flex w-full">
                  <div className="ml-auto">
                    <div className="flex w-max shrink-0 items-center gap-2 tabular-nums">
                      <div className="flex flex-col items-center w-26 cursor-default py-2">
                        <div className="text-xs text-text-secondary">Market cap</div>
                        <div
                          className="text-lg font-medium leading-tight tabular-nums"
                          translate="no"
                        >
                          {formatCompact(num(tokenStats.marketCap))}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          Price
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          <span className="tabular-nums" translate="no">
                            {formatPrice(livePrice)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          24H change
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          <div
                            className="flex gap-0.75 items-center"
                            translate="no"
                            style={{ lineHeight: "20px" }}
                          >
                            <div
                              style={{
                                color:
                                  (priceChange24h || 0) >= 0
                                    ? "rgb(34,197,94)"
                                    : "rgb(255, 98, 46)",
                                fontWeight: 400,
                                fontSize: 8,
                              }}
                            >
                              {(priceChange24h || 0) >= 0 ? "▲" : "▼"}
                            </div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color:
                                  (priceChange24h || 0) >= 0
                                    ? "rgb(34,197,94)"
                                    : "rgb(255, 98, 46)",
                              }}
                            >
                              {Math.abs(priceChange24h || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          24H Vol.
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {formatCompact(num(tokenStats.volume24h))}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          Liquidity
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {formatCompact(num(tokenStats.liquidity))}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          Holders
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {num(tokenStats.holders).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap">
                          Top 10 holding
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {num(tokenStats.top10HoldersPercent).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-4 shrink-0" aria-hidden="true" />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l to-transparent from-bg-primary" />
            </div>
          )}
        </div>
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

export default memo(TokenChart);
