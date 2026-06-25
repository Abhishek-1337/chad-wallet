"use client";

import { ArrowRight, Download } from "lucide-react";

export default function Hero() {
  return (
    <section className="flex w-full flex-col items-center justify-center">
      <img
        src="/fomo-assets/space-bg.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-10 w-full select-none bg-cover"
      />

      <div className="flex flex-col items-center gap-3 desktop:gap-8">
        <div className="flex flex-col items-center gap-2 px-6 pt-10 text-center desktop:pt-20">
          {/* <div className="flex items-center"> */}
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
              C
            </div> */}
            <span className="text-[120px]/40 font-bold tracking-tight text-slate-300">
              ChadWallet
            </span>
          {/* </div> */}
          <h1 className="text-[24px] leading-6 tracking-tighter font-medium text-text-primary desktop:text-[40px] desktop:leading-12">
            where traders become legends.
          </h1>
          <p className="tracking-tight text-text-secondary desktop:text-[22px] desktop:leading-6">
            From memecoins to viral tokens, trade any crypto in seconds.
          </p>
        </div>

        {/* Mobile buttons */}
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

        {/* Desktop buttons */}
        <div className="hidden gap-3 desktop:flex">
          <a
            href="/trade"
            className="group z-2 flex hidden w-50 items-center justify-center overflow-hidden rounded-xl border border-bg-tertiary bg-[#606AF780] py-3 text-lg font-bold backdrop-blur-md transition-colors duration-150 hover:bg-[#606AF7CC] desktop:flex"
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

      {/* Astronaut images */}
      <img
        src="/fomo-assets/astronaut-mobile.webp"
        alt=""
        className="-mt-16 animate-float desktop:hidden"
      />
      <img
        src="/fomo-assets/astronaut.webp"
        alt=""
        className="-mt-10 hidden h-130 animate-float object-contain desktop:block"
      />
    </section>
  );
}
