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

const TABS = [
  { key: "holders", label: "holders" },
  { key: "trades", label: "swaps" },
  { key: "about", label: "thesis" },
] as const;

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
  const [activeTab, setActiveTab] = useState<Tab>("holders");
  const [timeframe, setTimeframe] = useState<Timeframe>("1W");
  const [feedFilter, setFeedFilter] = useState<"thesis" | "friends">("friends");
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
    if (chartRef.current && chartContainerRef.current) {
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
                <BadgeCheckIcon size={18} />
              </div>
            </div>
          </button>
          <div className="flex flex-col gap-1 w-52 shrink-0">
            <div className="flex gap-1 items-center">
              <div className="text-base leading-tight" translate="no">
                {tokenSymbol || "SOL"}
              </div>
              <RobinhoodLogoIcon
                size={20}
                className="shrink-0 text-text-secondary hover:text-text-primary transition-colors"
              />
              <div className="w-px h-4 bg-bg-tertiary mx-0.5" />
              <div className="flex gap-1 items-center">
                {fullTokenData?.socialLinks?.website && (
                  <a
                    href={fullTokenData.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Website"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <GlobeIcon />
                  </a>
                )}
                {fullTokenData?.socialLinks?.twitter && (
                  <a
                    href={fullTokenData.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <TwitterIcon />
                  </a>
                )}
                {fullTokenData?.socialLinks?.telegram && (
                  <a
                    href={fullTokenData.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Telegram"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <TelegramIcon />
                  </a>
                )}
                {fullTokenData?.socialLinks?.discord && (
                  <a
                    href={fullTokenData.socialLinks.discord}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Discord"
                    className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <DiscordIcon />
                  </a>
                )}
                <a
                  href={`https://x.com/search?q=${encodeURIComponent(
                    tokenAddress + " OR $" + (tokenSymbol || "")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Search on X"
                  className="flex items-center justify-center rounded-sm bg-bg-tertiary overflow-hidden p-0.5 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <SearchIcon />
                </a>
              </div>
              <button onClick={copyAddress} aria-label="Favorite">
                <StarEmptyIcon size={16} className="size-4 text-text-tertiary" />
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
                        <div className="text-xs text-text-secondary font-semibold">Market cap</div>
                        <div
                          className="text-lg leading-tight tabular-nums font-semibold"
                          translate="no"
                        >
                          {formatCompact(num(tokenStats.marketCap))}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap font-semibold">
                          Price
                        </div>
                        <div
                          className="text-sm whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          <span className="tabular-nums font-semibold" translate="no">
                            {formatPrice(livePrice)}
                          </span>
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap font-semibold">
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
                              className="font-semibold"
                            >
                              {Math.abs(priceChange24h || 0).toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap font-semibold">
                          24H Vol.
                        </div>
                        <div
                          className="text-sm font-semibold whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {formatCompact(num(tokenStats.volume24h))}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap font-semibold">
                          Liquidity
                        </div>
                        <div
                          className="text-sm font-semibold whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {formatCompact(num(tokenStats.liquidity))}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap font-semibold">
                          Holders
                        </div>
                        <div
                          className="text-sm font-semibold whitespace-nowrap min-h-5 flex items-center"
                          translate="no"
                        >
                          {num(tokenStats.holders).toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-bg-secondary rounded-lg flex flex-col items-center min-w-22 px-2 py-1.5">
                        <div className="text-xs text-text-secondary whitespace-nowrap font-semibold">
                          Top 10 holding
                        </div>
                        <div
                          className="text-sm font-semibold whitespace-nowrap min-h-5 flex items-center"
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

      

      <div>
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
      <div className="px-2 pl-3 rounded-t-lg bg-bg-secondary flex items-center justify-between shrink-0 h-10">
        <div className="flex gap-3 text-sm">
          {TABS.map((t) => (
            <div key={t.key} className="flex items-center gap-3">
              {t.key !== "holders" && (
                <div className="w-px h-4 bg-bg-tertiary/40" />
              )}
              <button
                onClick={() => setActiveTab(t.key)}
                className={`${
                  activeTab === t.key
                    ? "text-text-primary"
                    : "text-text-tertiary"
                } hover:text-text-secondary focus:outline-none capitalize`}
              >
                {t.label}
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFeedFilter("thesis")}
            className="flex items-center gap-1 rounded-md p-1 hover:opacity-80 cursor-pointer"
          >
            <button
              type="button"
              className="pointer-events-none inline-flex items-center justify-center"
              style={{ color: feedFilter === "thesis" ? "var(--color-accent-primary)" : "var(--color-text-tertiary)", width: 16, height: 16 }}
            >
              {feedFilter === "thesis" ? <CheckBoxFilledIcon /> : <CheckBoxIcon />}
            </button>
            <span className="text-text-secondary text-xs">Thesis only</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setFeedFilter("friends")}
            className="flex items-center gap-1 rounded-md p-1 hover:opacity-80 cursor-pointer"
          >
            <button
              type="button"
              className="pointer-events-none inline-flex items-center justify-center"
              style={{ color: feedFilter === "friends" ? "var(--color-accent-primary)" : "var(--color-text-tertiary)", width: 16, height: 16 }}
            >
              {feedFilter === "friends" ? <CheckBoxFilledIcon /> : <CheckBoxIcon />}
            </button>
            <span className="text-text-secondary text-xs">Friends only</span>
          </div>
        </div>
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

function GlobeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function TwitterIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6083-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z" />
    </svg>
  );
}

function BadgeCheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function StarEmptyIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function RobinhoodLogoIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4.2a5.8 5.8 0 0 1 3.66 1.31L12 13.6 8.34 7.51A5.8 5.8 0 0 1 12 6.2zm-4.38 2.2 3.66 6.2-3.66 6.2A5.8 5.8 0 0 1 6.2 12c0-2.1 1.12-3.94 2.82-4.96zM12 17.8l3.66-6.2L12 10.4 8.34 11.6 12 17.8zm4.38-2.2-3.66-6.2 3.66-6.2A5.8 5.8 0 0 1 17.8 12c0 2.1-1.12 3.94-2.82 4.96z" />
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  );
}

function CheckBoxIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
    </svg>
  );
}

function CheckBoxFilledIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M8.5 11.5 11 14l4.5-5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default memo(TokenChart);
