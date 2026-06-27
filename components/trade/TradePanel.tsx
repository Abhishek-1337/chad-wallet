"use client";

import { memo, useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ArrowDownUp } from "lucide-react";

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface TradePanelProps {
  tokenAddress: string;
}

function TradePanel({ tokenAddress }: TradePanelProps) {
  const { ready, authenticated, login } = usePrivy();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<{ outAmount: string; priceImpactPct: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const inputMint = mode === "buy" ? SOL_MINT : tokenAddress;
  const outputMint = mode === "buy" ? tokenAddress : SOL_MINT;

  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          action: "quote",
          inputMint,
          outputMint,
          amount: (parseFloat(amount) * 1e9).toString(),
          slippageBps: "50",
        });
        const res = await fetch(`/api/jupiter?${params}`);
        const data = await res.json();
        if (data.outAmount) {
          setQuote({
            outAmount: (parseFloat(data.outAmount) / 1e9).toFixed(6),
            priceImpactPct: data.priceImpactPct,
          });
        }
      } catch {}
      setLoading(false);
    }, 500);

    return () => clearTimeout(debounce);
  }, [amount, inputMint, outputMint]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-white">Swap</h3>

      {/* Mode toggle */}
      <div className="mb-6 flex gap-1 rounded-xl bg-zinc-900 p-1">
        <button
          onClick={() => setMode("buy")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "buy"
              ? "bg-green-500/20 text-green-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "sell"
              ? "bg-red-500/20 text-red-500"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Input */}
      <div className="mb-2">
        <label className="mb-1 block text-xs text-zinc-500">
          You pay ({mode === "buy" ? "SOL" : "Token"})
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 pr-20 text-lg text-white outline-none transition-colors focus:border-zinc-700"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            {mode === "buy" ? "SOL" : "Token"}
          </span>
        </div>
      </div>

      {/* Swap icon */}
      <div className="flex justify-center py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
          <ArrowDownUp size={14} className="text-zinc-400" />
        </div>
      </div>

      {/* Output */}
      <div className="mb-6">
        <label className="mb-1 block text-xs text-zinc-500">
          You receive ({mode === "buy" ? "Token" : "SOL"})
        </label>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
          <div className="text-lg text-white">
            {loading ? (
              <span className="animate-pulse">Fetching...</span>
            ) : quote ? (
              quote.outAmount
            ) : (
              "0.00"
            )}
          </div>
          {quote && quote.priceImpactPct && parseFloat(quote.priceImpactPct) > 0 && (
            <div className="mt-1 text-xs text-zinc-500">
              Price impact: {parseFloat(quote.priceImpactPct).toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {!ready || !authenticated ? (
        <button
          onClick={login}
          className="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7C3AED]"
        >
          Connect Wallet to Swap
        </button>
      ) : (
        <button
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === "buy" ? "Buy" : "Sell"}
        </button>
      )}

      <div className="mt-4 space-y-2 text-xs text-zinc-500">
        <div className="flex justify-between">
          <span>Network</span>
          <span className="text-zinc-400">Solana</span>
        </div>
        <div className="flex justify-between">
          <span>Slippage</span>
          <span className="text-zinc-400">0.5%</span>
        </div>
      </div>
    </div>
  );
}

export default memo(TradePanel);
