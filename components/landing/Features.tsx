import { Zap, Shield, TrendingUp, Gauge } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Solana-Native Speed",
    description:
      "Built directly on Solana for sub-second transactions and near-zero fees. No bridges, no waiting.",
  },
  {
    icon: TrendingUp,
    title: "Built-In Trading",
    description:
      "Swap any Solana token directly from your wallet with best-in-class routing via Jupiter.",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description:
      "Sign in with Apple or Google via Privy. Your keys, your coins — without the seed phrase hassle.",
  },
  {
    icon: Gauge,
    title: "Real-Time Prices",
    description:
      "Live token prices, charts, and on-chain data powered by Codex.io — no third-party apps needed.",
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Everything a Chad needs
        </h2>
        <p className="mt-4 text-zinc-400">
          No fluff. Just the tools to trade smarter on Solana.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-colors hover:border-zinc-700"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
              <feature.icon size={24} />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
