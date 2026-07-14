"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets, useSignTransaction } from "@privy-io/react-auth/solana";
import { VersionedTransaction, PublicKey } from "@solana/web3.js";
import { Settings, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getConnection } from "@/lib/alchemy";

const SOL_MINT = "So11111111111111111111111111111111111111112";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

interface TradePanelProps {
  tokenAddress: string;
  tokenSymbol?: string;
}

type TxStatus = "idle" | "signing" | "sending" | "confirmed" | "failed";

function TradePanel({ tokenAddress, tokenSymbol = "Token" }: TradePanelProps) {
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useWallets();
  const { signTransaction } = useSignTransaction();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<{ outAmount: string } | null>(null);
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

  const amountValid = !!amount && parseFloat(amount) > 0 && !!quote && !sameMint;

  return (
    <div className="flex flex-col">
      <div className="border border-bg-tertiary rounded-2xl p-2 flex flex-col gap-2">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("buy")}
            className={`flex-1 p-2 rounded-lg text-base font-bold transition-colors ${
              mode === "buy"
                ? "bg-green-transparent text-green"
                : "bg-bg-secondary hover:bg-bg-tertiary text-text-secondary"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setMode("sell")}
            className={`flex-1 p-2 rounded-lg text-base font-bold transition-colors ${
              mode === "sell"
                ? "bg-green-transparent text-green"
                : "bg-bg-secondary hover:bg-bg-tertiary text-text-secondary"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Amount input */}
        <div className="bg-bg-secondary rounded-xl flex items-stretch text-3xl gap-px cursor-text relative border border-transparent focus-within:border-bg-tertiary">
          <div className="flex flex-1 min-w-0 items-center gap-px p-4 pr-0">
            <div className="text-text-tertiary">$</div>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-text-tertiary"
            />
          </div>
          <div className="shrink-0 flex flex-col items-end justify-center p-4 pl-6 relative cursor-pointer">
            <div className="text-sm font-medium text-text-tertiary">Enter amount</div>
          </div>
        </div>

        {/* Quick amounts + settings */}
        <div className="flex gap-1">
          <div className="grid grid-cols-4 gap-2 flex-1">
            {["$10", "$100", "$500", "$1000"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setAmount(label.replace("$", ""))}
                className="hover-scrim h-8 rounded-lg bg-bg-secondary px-3 text-sm font-bold text-text-primary"
                translate="no"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="h-8 w-8 shrink-0 flex items-center justify-center text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Available */}
        <div className="flex flex-col px-2 text-sm">
          <div className="flex justify-between items-center">
            <div className="text-text-secondary">
              <span translate="no">
                ${solBalance !== null ? solBalance.toFixed(2) : "0"} available
              </span>
            </div>
          </div>
        </div>

        {/* Status / CTA */}
        {txStatus !== "idle" ? (
          <div className="py-2 h-11 rounded-xl border border-bg-tertiary/60 px-4 text-sm flex items-center overflow-hidden">
            {txStatus === "signing" && (
              <span className="flex items-center gap-2 text-yellow-400">
                <Loader2 size={14} className="animate-spin" /> Signing transaction...
              </span>
            )}
            {txStatus === "sending" && (
              <span className="flex items-center gap-2 text-yellow-400">
                <Loader2 size={14} className="animate-spin" /> Sending transaction...
              </span>
            )}
            {txStatus === "confirmed" && (
              <span className="flex items-center gap-2 text-green">
                <CheckCircle size={14} /> Swap confirmed
                {txSignature && (
                  <a
                    href={`https://solscan.io/tx/${txSignature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto underline"
                  >
                    View
                  </a>
                )}
              </span>
            )}
            {txStatus === "failed" && (
              <span className="flex items-center gap-2 text-red">
                <XCircle size={14} /> {error || "Swap failed"}
              </span>
            )}
          </div>
        ) : !ready || !authenticated ? (
          <button
            onClick={login}
            className="py-2 bg-accent-primary text-white h-11 rounded-xl border border-bg-tertiary/60 px-4 text-base font-bold overflow-hidden transition-colors hover:opacity-90"
          >
            <span className="inline-block animate-flip-up">Connect Wallet</span>
          </button>
        ) : (
          <button
            onClick={handleSwap}
            disabled={swapping || !amountValid}
            className="py-2 bg-accent-primary text-white h-11 rounded-xl border border-bg-tertiary/60 px-4 text-base font-bold overflow-hidden transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="inline-block animate-flip-up">
              {swapping ? "Swapping..." : `${mode === "buy" ? "Buy" : "Sell"} ${tokenSymbol}`}
            </span>
          </button>
        )}
      </div>

      {/* Expandable area */}
      <div className="grid transition-[grid-template-rows,margin-top] duration-300 ease-out grid-rows-[0fr] mt-0">
        <div className="overflow-hidden min-h-0"></div>
      </div>
    </div>
  );
}

export default memo(TradePanel);
