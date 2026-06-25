"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  const [count, setCount] = useState(0);
  const targetCount = 142856;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = targetCount / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 pt-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-[#8B5CF6]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        <div className="mb-4 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-xs text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Solana mainnet live
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          The wallet that
          <br />
          <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
            trades while others wait
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg">
          Solana-native self-custody wallet with built-in trading, real-time
          prices, and one-click swaps. No seed phrases. No delays. Just Chad.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <a
            href="https://apps.apple.com/us/app/chadwallet/id6757367474"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200"
          >
            Download on iOS
            <ArrowUpRight size={16} />
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=xyz.chadwallet.www"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
          >
            Get it on Android
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="mt-12 flex items-center gap-3 text-zinc-500">
          <span className="text-2xl font-bold text-white">
            {count.toLocaleString()}
          </span>
          <span className="text-sm">wallets created</span>
        </div>
      </div>
    </section>
  );
}
