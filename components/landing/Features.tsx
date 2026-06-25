const features = [
  {
    label: "LEADERBOARD",
    title: "become a legend, top the leaderboard",
    image: "/fomo-assets/leaderboard.webp",
  },
  {
    label: "FEED",
    title: "discover and follow top traders",
    image: "/fomo-assets/social-static.webp",
  },
  {
    label: "ALERTS",
    title: "real time notifications for what the best are buying",
    image: "/fomo-assets/alerts-static.webp",
  },
  {
    label: "EASY ONBOARDING",
    title: "create an account in an instant",
    image: "/fomo-assets/sign-in-static.webp",
  },
  {
    label: "ZERO COMPLEXITY",
    title: "multichain & gasless",
    image: "/fomo-assets/assets-static.webp",
  },
  {
    label: "ONE CLICK TO BUY",
    title: "fund with apple pay",
    image: "/fomo-assets/apple-pay-static.webp",
  },
];

export default function Features() {
  return (
    <div className="flex max-w-500 flex-col self-stretch px-3 pt-8 desktop:px-20 desktop:py-2">
      {/* Desktop heading */}
      <div className="hidden flex-col gap-3 desktop:flex">
        <h2 className="text-[60px] leading-15 tracking-tighter">
          never miss out again
        </h2>
        <p className="text-[28px] leading-6 text-text-secondary">
          the only social-first trading app
        </p>
      </div>

      {/* Mobile heading */}
      <div className="mb-8 flex flex-col gap-1 text-center desktop:hidden">
        <div className="text-xs font-bold tracking-widest text-accent-primary">
          NEVER MISS OUT AGAIN
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          the only social-first trading app
        </h2>
      </div>

      <div className="flex flex-col gap-3 desktop:gap-6">
        {/* Row 1 */}
        <div className="flex flex-col gap-3 desktop:flex-row desktop:gap-6">
          {features.slice(0, 3).map((f) => (
            <FeatureCard key={f.label} {...f} />
          ))}
        </div>
        {/* Row 2 */}
        <div className="flex flex-col gap-3 desktop:flex-row desktop:gap-6">
          {features.slice(3, 6).map((f) => (
            <FeatureCard key={f.label} {...f} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  label,
  title,
  image,
}: {
  label: string;
  title: string;
  image: string;
}) {
  return (
    <div className="group flex aspect-square min-w-0 flex-1 shrink flex-col overflow-hidden rounded-[25px] border border-bg-tertiary bg-bg-secondary pb-0 pt-8 transition-colors duration-300 hover:border-white/12">
      <div className="px-8 font-mono text-sm font-bold text-accent-primary">
        {label}
      </div>
      <h3 className="px-8 text-[28px] leading-8 tracking-tight desktop:text-[36px] desktop:leading-10">
        {title}
      </h3>
      <div className="min-h-0 flex-1">
        <img
          loading="lazy"
          src={image}
          alt=""
          className="h-full w-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </div>
  );
}
