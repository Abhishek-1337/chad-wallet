"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

interface TokenAboutProps {
  tokenAddress: string;
  token?: {
    name?: string;
    symbol?: string;
    description?: string;
    totalSupply?: string;
    circulatingSupply?: string;
    decimals?: number;
    top10HoldersPercent?: number;
    creatorAddress?: string;
    createdAt?: number;
    socialLinks?: { twitter?: string; telegram?: string; discord?: string; website?: string };
    launchpad?: { launchpadName?: string; graduationPercent?: number; completed?: boolean; migrated?: boolean; category?: string };
    mintable?: string;
    freezable?: string;
  };
}

interface TokenStats {
  priceChanges: Record<string, number | null>;
  buys: number;
  sells: number;
  buyVolume: number;
  sellVolume: number;
  buyers: number;
  sellers: number;
}

function formatSupply(value: string | undefined): string {
  if (!value) return "---";
  const num = parseFloat(value);
  if (isNaN(num)) return "---";
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatVolume(value: number): string {
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatCompact(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

function timeAgo(ts: number | undefined): string {
  if (!ts) return "---";
  const diff = Math.floor(Date.now() / 1000) - ts;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function truncateAddress(addr: string | undefined): string {
  if (!addr) return "---";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function TokenAbout({ tokenAddress, token }: TokenAboutProps) {
  const [expanded, setExpanded] = useState(false);
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [selectedTf, setSelectedTf] = useState<string>("1H");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/codex/token/stats?address=${tokenAddress}&tf=${selectedTf}`)
      .then((r) => r.json())
      .then((data) => { if (data && !data.error) setStats(data); })
      .catch(() => {});
  }, [tokenAddress, selectedTf]);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!token) return null;

  const description = token.description || "";
  const isLong = description.length > 150;
  const displayText = expanded || !isLong ? description : description.slice(0, 150) + "...";

  const totalVol = (stats?.buyVolume || 0) + (stats?.sellVolume || 0);
  const buyVolPct = totalVol > 0 ? (stats!.buyVolume / totalVol) * 100 : 50;
  const totalTxns = (stats?.buys || 0) + (stats?.sells || 0);
  const buyTxnPct = totalTxns > 0 ? (stats!.buys / totalTxns) * 100 : 50;
  const totalTraders = (stats?.buyers || 0) + (stats?.sellers || 0);
  const buyerPct = totalTraders > 0 ? (stats!.buyers / totalTraders) * 100 : 50;

  return (
    <div className="flex flex-col gap-3">
      {/* About */}
      <div className="flex flex-col gap-1 px-1">
        <span className="text-sm font-medium text-white">
          About <span>{token.symbol || "---"}</span>
        </span>
        {description ? (
          <div className="flex items-baseline gap-0">
            <span className="min-w-0 truncate text-xs leading-tight text-zinc-400">
              {displayText}
            </span>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="shrink-0 text-xs font-bold leading-tight text-zinc-500 hover:text-zinc-300"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-500">No description available.</span>
        )}
      </div>

      {/* Price change buttons */}
      {stats && (
        <div className="flex gap-1.5">
          {(["5M", "1H", "4H", "1D"] as const).map((tf) => {
            const change = stats.priceChanges[tf];
            const isUp = change != null && change >= 0;
            const color = isUp ? "text-green-500" : "text-red-500";
            const isSelected = selectedTf === tf;
            return (
              <button
                key={tf}
                type="button"
                onClick={() => setSelectedTf(tf)}
                className={`flex flex-1 flex-col items-center rounded-md border py-1.5 transition-colors ${
                  isSelected
                    ? "border-zinc-700 bg-zinc-800"
                    : "border-zinc-800 hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-xs text-zinc-400">{tf}</span>
                {change != null && (
                  <div className={`flex items-center gap-0.5 ${color}`}>
                    <span className="text-[6px]">{isUp ? "▲" : "▼"}</span>
                    <span className="text-xs font-medium">
                      {Math.abs(change).toFixed(2)}%
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Buy/Sell stats */}
      {stats && (
        <div className="flex flex-col gap-3 px-2">
          {/* Buys vs Sells */}
          <StatBar
            leftLabel="buys"
            rightLabel="sells"
            leftValue={stats.buys}
            rightValue={stats.sells}
            pct={buyTxnPct}
          />

          {/* Volume */}
          <StatBar
            leftLabel="vol."
            rightLabel="vol."
            leftValue={formatVolume(stats.buyVolume)}
            rightValue={formatVolume(stats.sellVolume)}
            pct={buyVolPct}
          />

          {/* Buyers vs Sellers */}
          <StatBar
            leftLabel="buyers"
            rightLabel="sellers"
            leftValue={stats.buyers}
            rightValue={stats.sellers}
            pct={buyerPct}
          />
        </div>
      )}

      {/* Info rows */}
      <div className="flex flex-col gap-1 px-2 pt-1">
        <InfoRow label="Supply" value={formatSupply(token.totalSupply)} />
        <InfoRow
          label="Network"
          value="Solana"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.3" />
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          }
        />
        <InfoRow label="Created" value={timeAgo(token.createdAt)} />
        <div className="flex items-center gap-2 py-1">
          <span className="shrink-0 text-xs text-zinc-400">Contract</span>
          <div className="min-w-4 flex-1 border-b border-dashed border-zinc-800" />
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 transition-opacity hover:opacity-70"
          >
            <span className="whitespace-nowrap text-xs font-medium text-white">
              {truncateAddress(tokenAddress)}
            </span>
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-zinc-500" />
            )}
          </button>
        </div>
      </div>

      {/* Social links */}
      {token.socialLinks && (
        <div className="flex flex-wrap gap-2 px-2 pt-1">
          {token.socialLinks.website && (
            <a href={token.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-400 transition-opacity hover:opacity-80">
              <GlobeIcon /> Website
            </a>
          )}
          {token.socialLinks.twitter && (
            <a href={token.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-400 transition-opacity hover:opacity-80">
              <TwitterIcon /> Twitter
            </a>
          )}
          {token.socialLinks.telegram && (
            <a href={token.socialLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-400 transition-opacity hover:opacity-80">
              <TelegramIcon /> Telegram
            </a>
          )}
          {token.socialLinks.discord && (
            <a href={token.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-400 transition-opacity hover:opacity-80">
              <DiscordIcon /> Discord
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function StatBar({
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  pct,
}: {
  leftLabel: string;
  rightLabel: string;
  leftValue: number | string;
  rightValue: number | string;
  pct: number;
}) {
  const fmt = (v: number | string) => typeof v === "number" ? formatCompact(v) : v;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span>
          <span className="font-medium text-white">{fmt(leftValue)}</span>{" "}
          <span className="text-zinc-400">{leftLabel}</span>
        </span>
        <span>
          <span className="font-medium text-white">{fmt(rightValue)}</span>{" "}
          <span className="text-zinc-400">{rightLabel}</span>
        </span>
      </div>
      <div className="flex h-1.5 gap-1">
        <div
          className="rounded-[1.5px] bg-green-500 transition-[width] duration-150 ease-out"
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
        <div className="flex-1 rounded-[1.5px] bg-red-500" />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="shrink-0 text-xs text-zinc-400">{label}</span>
      <div className="min-w-4 flex-1 border-b border-dashed border-zinc-800" />
      <div className="flex shrink-0 items-center gap-1">
        {icon}
        <span className="whitespace-nowrap text-xs font-medium text-white">{value}</span>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}
