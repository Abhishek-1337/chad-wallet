"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSignTransaction } from "@privy-io/react-auth/solana";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { ArrowDownUp, Loader2, CheckCircle, XCircle } from "lucide-react";
import { getConnection } from "@/lib/alchemy";

const SOL_MINT = "So11111111111111111111111111111111111111112";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

interface TradePanelProps {
  tokenAddress: string;
}

type TxStatus = "idle" | "signing" | "sending" | "confirmed" | "failed";

function TradePanel({ tokenAddress }: TradePanelProps) {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<{ outAmount: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);

  const wallet = wallets?.[0];
  const userAddress = wallet?.address;

  const inputMint = mode === "buy" ? SOL_MINT : tokenAddress;
  const outputMint = mode === "buy" ? tokenAddress : SOL_MINT;
  const sameMint = inputMint === outputMint;

  useEffect(() => {
    if (!authenticated || !userAddress) return;
    getConnection().getBalance(new PublicKey(userAddress))
      .then((b) => setSolBalance(b / 1e9))
      .catch(() => {});
  }, [authenticated, userAddress]);

  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0 || sameMint) {
      setQuote(null);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          action: "order",
          inputMint,
          outputMint,
          amount: (parseFloat(amount) * 1e9).toString(),
          taker: userAddress || "",
          slippageBps: "50",
        });
        const res = await fetch(`/api/jupiter?${params}`);
        const data = await res.json();
        if (data.outAmount) {
          setQuote({
            outAmount: (parseFloat(data.outAmount) / 1e9).toFixed(6),
          });
        }
      } catch {}
      setLoading(false);
    }, 500);

    return () => clearTimeout(debounce);
  }, [amount, inputMint, outputMint, userAddress]);

  const handleSwap = useCallback(async () => {
    if (!wallet || !userAddress || !amount || parseFloat(amount) <= 0) return;

    setSwapping(true);
    setTxStatus("signing");
    setError(null);
    setTxSignature(null);

    try {
      const params = new URLSearchParams({
        action: "order",
        inputMint,
        outputMint,
        amount: (parseFloat(amount) * 1e9).toString(),
        taker: userAddress,
        slippageBps: "50",
      });
      const orderRes = await fetch(`/api/jupiter?${params}`);
      const orderData = await orderRes.json();
      if (!orderData.transaction) throw new Error(orderData.errorMessage || "Failed to get order");

      const txBytes = Uint8Array.from(atob(orderData.transaction), (c) => c.charCodeAt(0));
      const transaction = VersionedTransaction.deserialize(txBytes);

      setTxStatus("signing");
      const { signedTransaction } = await signTransaction({
        transaction: transaction.serialize(),
        wallet,
        chain: "solana:mainnet" as any,
      });

      setTxStatus("sending");
      const signedTxBase64 = toBase64(signedTransaction);

      const executeRes = await fetch("/api/jupiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedTransaction: signedTxBase64,
          requestId: orderData.requestId,
        }),
      });
      const executeData = await executeRes.json();

      if (executeData.status === "Success") {
        setTxSignature(executeData.signature);
        setTxStatus("confirmed");
      } else {
        throw new Error(executeData.error || "Swap failed");
      }
    } catch (err: any) {
      setTxStatus("failed");
      setError(err?.message || "Swap failed");
    } finally {
      setSwapping(false);
    }
  }, [wallet, userAddress, amount, inputMint, outputMint, signTransaction]);

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
          {sameMint && (
            <div className="mt-1 text-xs text-zinc-500">
              Select a different token to swap
            </div>
          )}
          {quote && parseFloat(quote.outAmount) > 0 && !sameMint && (
            <div className="mt-1 text-xs text-zinc-500">
              Est. ~{quote.outAmount} {mode === "buy" ? "tokens" : "SOL"}
            </div>
          )}
        </div>
      </div>

      {/* Status display */}
      {txStatus !== "idle" && (
        <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm">
          {txStatus === "signing" && (
            <div className="flex items-center gap-2 text-yellow-400">
              <Loader2 size={14} className="animate-spin" />
              Signing transaction...
            </div>
          )}
          {txStatus === "sending" && (
            <div className="flex items-center gap-2 text-yellow-400">
              <Loader2 size={14} className="animate-spin" />
              Sending transaction...
            </div>
          )}
          {txStatus === "confirmed" && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={14} />
              Swap confirmed
              {txSignature && (
                <a
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-[#8B5CF6] underline"
                >
                  View
                </a>
              )}
            </div>
          )}
          {txStatus === "failed" && (
            <div className="flex items-center gap-2 text-red-400">
              <XCircle size={14} />
              {error || "Swap failed"}
            </div>
          )}
        </div>
      )}

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
          onClick={handleSwap}
          disabled={swapping || !amount || parseFloat(amount) <= 0 || !quote || sameMint}
          className="w-full rounded-xl bg-[#8B5CF6] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {swapping ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Swapping...
            </span>
          ) : mode === "buy" ? (
            "Buy"
          ) : (
            "Sell"
          )}
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
        {solBalance !== null && (
          <div className="flex justify-between">
            <span>SOL Balance</span>
            <span className="text-zinc-400">{solBalance.toFixed(4)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(TradePanel);
