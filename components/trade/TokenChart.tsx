"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, type CandlestickData, ColorType } from "lightweight-charts";
import HoldersList from "./HoldersList";
import LiveTrades from "./LiveTrades";

interface TokenChartProps {
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  price: number;
  priceChange24h: number;
}

export default function TokenChart({
  tokenAddress,
  tokenName,
  tokenSymbol,
  tokenLogo,
  price,
  priceChange24h,
}: TokenChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "holders" | "trades">("chart");

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
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#27272a",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    const fetchOHLCV = async () => {
      try {
        const res = await fetch(
          `/api/codex/tokens/${tokenAddress}/ohlcv?interval=1h&limit=100`
        );
        const data = await res.json();
        const raw = data.data || data;
        if (Array.isArray(raw)) {
          const formatted: CandlestickData[] = raw.map((d: any) => ({
            time: (d.timestamp || d.time) as any,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
          }));
          candleSeries.setData(formatted);
        }
      } catch {}
    };

    fetchOHLCV();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [tokenAddress]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        {tokenLogo && (
          <img src={tokenLogo} alt="" className="h-10 w-10 rounded-full" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">{tokenSymbol || "SOL"}</h2>
            <span className="text-sm text-zinc-400">{tokenName || "Solana"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">
              ${price?.toLocaleString(undefined, { maximumFractionDigits: 6 })}
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
      </div>

      <div ref={chartContainerRef} className="mb-4" />

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-zinc-900 p-1">
        {(["chart", "holders", "trades"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#8B5CF6] text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab === "chart" ? "Price" : tab === "holders" ? "Holders" : "Live Trades"}
          </button>
        ))}
      </div>

      {activeTab === "holders" && <HoldersList tokenAddress={tokenAddress} />}
      {activeTab === "trades" && <LiveTrades tokenAddress={tokenAddress} />}
    </div>
  );
}
