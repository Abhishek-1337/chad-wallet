import { LogIn, Wallet, ArrowRightLeft } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    title: "Connect",
    description: "Sign in with Google or Apple using Privy. No seed phrase needed.",
    step: "01",
  },
  {
    icon: Wallet,
    title: "Fund",
    description: "Deposit SOL or any SPL token directly to your embedded Solana wallet.",
    step: "02",
  },
  {
    icon: ArrowRightLeft,
    title: "Trade",
    description: "Swap tokens instantly with Jupiter routing. Real-time prices, minimal slippage.",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-zinc-400">
          Three steps to start trading on Solana.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title} className="relative text-center">
            {i < steps.length - 1 && (
              <div className="absolute left-[60%] top-12 hidden h-px w-[80%] bg-gradient-to-r from-[#8B5CF6]/50 to-transparent md:block" />
            )}
            <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-[#8B5CF6]/10">
              <step.icon size={36} className="text-[#8B5CF6]" />
            </div>
            <div className="mb-2 text-sm font-medium text-[#8B5CF6]">
              Step {step.step}
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-zinc-400">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
