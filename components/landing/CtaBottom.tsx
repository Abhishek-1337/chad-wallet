"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Download } from "lucide-react";

export default function CtaBottom() {
  const [count, setCount] = useState(0);
  const target = 500000;

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex w-full items-center justify-center self-stretch py-40 desktop:py-0">
      <img
        loading="lazy"
        src="/fomo-assets/legends.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-bg-primary to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg-primary to-transparent" />

      <div className="w-[80vw] px-8">
        <div className="relative flex aspect-square flex-col items-center justify-center">
          <div className="relative z-10 flex w-[70vw] flex-col items-center gap-3 desktop:gap-6">
            <h2 className="text-center text-[40px] leading-10 tracking-tight desktop:text-[60px] desktop:leading-15 font-semibold">
              a trading app
              <br />
              for the rest of us
            </h2>
            <p className="text-center tracking-tight text-text-secondary desktop:text-[22px] desktop:leading-7">
              join{" "}
              <span className="font-bold text-text-primary">
                {count.toLocaleString()}
              </span>{" "}
              traders making their name on ChadWallet
            </p>
            <div className="pt-6">
              {/* Mobile */}
              <div className="flex gap-2 desktop:hidden">
                <a
                  href="https://apps.apple.com/us/app/chadwallet/id6757367474"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="z-2 w-50 rounded-xl border border-bg-tertiary bg-white/12 py-3 text-center text-lg font-bold backdrop-blur-md"
                >
                  Download app
                </a>
              </div>
              {/* Desktop */}
              <div className="hidden gap-3 desktop:flex">
                <a
                  href="/trade"
                  className="group z-2 flex w-50 items-center justify-center overflow-hidden rounded-xl border border-bg-tertiary bg-[#606AF780] py-3 text-lg font-bold backdrop-blur-md transition-colors duration-150 hover:bg-[#606AF7CC]"
                >
                  <span>Start trading</span>
                  <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-150 ease-out group-hover:w-7 group-hover:opacity-100">
                    <ArrowRight size={20} className="ml-2 shrink-0 stroke-2" />
                  </div>
                </a>
                <a
                  href="https://apps.apple.com/us/app/chadwallet/id6757367474"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group z-2 flex w-50 items-center justify-center overflow-hidden rounded-xl border border-bg-tertiary bg-white/12 py-3 text-lg font-bold backdrop-blur-md transition-colors duration-150 hover:bg-white/20"
                >
                  <div className="flex w-0 items-center overflow-hidden opacity-0 transition-all duration-150 ease-out group-hover:w-7 group-hover:opacity-100">
                    <Download size={20} className="mr-2 shrink-0 text-text-primary" />
                  </div>
                  <span>Download app</span>
                </a>
              </div>
            </div>
          </div>

          {/* Spinning circles */}
          <img
            loading="lazy"
            src="/fomo-assets/inner-circle.webp"
            alt=""
            className="absolute inset-0 z-1 m-auto w-[35vw] animate-spin-slow-reverse desktop:w-[30vw]"
          />
          <img
            loading="lazy"
            src="/fomo-assets/outer-circle.webp"
            alt=""
            className="absolute inset-0 z-1 m-auto w-screen animate-spin-slow desktop:max-w-275 desktop:w-[55vw]"
          />
        </div>
      </div>
    </div>
  );
}
