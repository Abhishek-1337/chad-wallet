# ChadWallet — Trade Solana at the Speed of Chad

A Solana-native self-custody wallet with live trading, real-time charts, and token analytics. Built for degens who move fast.

## What This Is

ChadWallet is a full-stack web application that lets users discover trending tokens, analyze market data in real-time, and execute swaps — all from a single interface. It's not a mockup. Every chart updates live. Every price is real. The swap flow actually signs and submits transactions on Solana.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 16** (App Router) | Server-side API routes keep API keys secure, SSR for landing page |
| Language | **TypeScript 5** | End-to-end type safety |
| UI | **React 19** | Component architecture, hooks for state management |
| Styling | **Tailwind CSS v4** | Utility-first, CSS-based config (no tailwind.config.ts) |
| Auth | **Privy** | Google/Apple OAuth + embedded Solana wallet in one SDK |
| Blockchain | **Solana** via `@solana/web3.js` + **Alchemy RPC** | Fast, cheap transactions |
| DEX | **Jupiter V2 Swap API** | Best-rate aggregation across all Solana DEXes |
| Market Data | **Codex GraphQL API** | Token metadata, prices, OHLCV, holders, swap events |
| Charts | **TradingView Lightweight Charts** | Professional candlestick charts, 5 timeframes |
| Icons | **lucide-react** | Consistent, lightweight icon set |

## Architecture

```
Client (React)                    Server (Next.js API Routes)           External APIs
─────────────                    ──────────────────────────            ─────────────
TokenList ──── lib/codex.ts ──── /api/codex/graphql ──────────────── Codex GraphQL
TokenChart ─── lib/codex.ts ──── /api/codex/token ───────────────── Codex GraphQL
TokenAbout ─── lib/codex.ts ──── /api/codex/token/stats ─────────── Codex GraphQL
TradePanel ─── /api/jupiter ─── /api/jupiter?action=order ────────── Jupiter V2
TradePanel ─── Privy SDK ────── signTransaction() (client-side) ──── Solana
TradePanel ─── /api/jupiter ─── POST /api/jupiter ────────────────── Jupiter V2 /execute
WalletButton ─ Privy SDK ────── login() / logout() ──────────────── Privy
```

**Key design decision**: All Codex API calls go through Next.js server routes. The API key never reaches the client. Client components call `lib/codex.ts` functions, which POST to `/api/codex/graphql`, which adds the auth header and forwards to Codex.

## Features

### Landing Page
- Hero section with animated astronaut assets and dual CTA (Start Trading + Download App)
- Live trending token marquee — real prices from Codex, scrolling animation
- 6-card feature showcase with hover effects
- Animated counter section (simulated 500K users)
- App Store / Google Play download links
- Full responsive design — separate mobile/desktop layouts

### Authentication
- Privy-powered login with Google or Apple
- Auto-creates embedded Solana wallet on first login
- No seed phrase management — wallet is ready instantly
- Wallet address display with copy-to-clipboard

### Token Discovery
- Trending tokens fetched from Codex GraphQL (filtered: liquidity >= $10K, not scam)
- Searchable token list with logo, symbol, name
- Live price polling every 10 seconds
- Price change indicators (green/red)
- Click any token to open full trade view

### Real-Time Charts
- TradingView candlestick charts (lightweight-charts v5)
- 5 timeframes: 1H, 4H, 1D, 1W, 1M
- OHLCV data auto-refreshes every 30 seconds
- Live price in chart header updates every 10 seconds
- Token info cards: market cap, price, 24h change, volume, liquidity, holders

### Token Analytics (About Tab)
- Token description with expandable text
- Price change buttons (5M, 1H, 4H, 1D) — live from Codex stats
- Buy vs Sell stat bars:
  - Total transactions (buy count vs sell count)
  - Volume (buy volume vs sell volume)
  - Unique buyers vs sellers
- Progress bars show proportion visually (green = buy, red = sell)
- Info rows: supply, network, creation date, contract address
- Social links: website, Twitter, Telegram, Discord

### Live Trade Feed
- Recent swap events with wallet address, type (BUY/SELL), amount, timestamp
- Auto-refreshes every 15 seconds
- Empty state handling

### Top Holders
- Top 10 token holders ranked by percentage
- Address display with truncation
- Loading skeleton and empty states

### Swap Panel (Jupiter V2)
- Buy/Sell toggle
- Real-time quote fetching (debounced 500ms)
- Estimated output display
- Full swap flow:
  1. Fetch order from Jupiter (via server proxy)
  2. Decode base64 transaction
  3. Sign via Privy `signTransaction()` (in iframe)
  4. Execute via Jupiter (via server proxy)
  5. Show confirmation with Solscan link
- SOL balance display
- Network indicator (Solana), slippage (0.5%)
- Transaction status tracking: idle → signing → sending → confirmed/failed

## Project Structure

```
chad-wallet/
├── app/
│   ├── layout.tsx              # Root layout, metadata, Providers wrapper
│   ├── page.tsx                # Landing page composition
│   ├── providers.tsx           # PrivyProvider setup
│   ├── globals.css             # Tailwind v4 theme, Aeonik font, animations
│   ├── trade/
│   │   ├── page.tsx            # Trade page with Suspense
│   │   └── TradeContent.tsx    # Main trade view orchestrator
│   └── api/
│       ├── jupiter/route.ts    # Jupiter V2 swap proxy
│       └── codex/
│           ├── graphql/        # Generic Codex GraphQL proxy
│           ├── token/          # Token metadata endpoint
│           └── token/stats/    # Token stats + OHLCV endpoint
├── components/
│   ├── shared/                 # Navbar, WalletButton
│   ├── landing/                # Hero, TokenBanner, Features, CtaBottom, Footer
│   └── trade/                  # TokenList, TokenChart, TradePanel, TokenAbout, LiveTrades, HoldersList
├── lib/
│   ├── codex.ts                # Codex GraphQL client (7 queries)
│   ├── jupiter.ts              # Jupiter API types (unused, proxy used instead)
│   ├── alchemy.ts              # Solana RPC connection
│   └── supabase.ts             # Supabase client (setup, not wired)
└── public/
    └── logo/                   # ChadWallet logos (dark.png, light.png)
```

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables (copy to .env.local)
cp .env.example .env.local
# Fill in: PRIVY_APP_ID, CODEX_API_KEY, ALCHEMY_RPC_URL, SUPABASE keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).


## Design Decisions Worth Noting

1. **Server-side API proxy pattern** — All third-party API keys stay on the server. Client code calls `lib/codex.ts`, which hits Next.js API routes. This is the standard pattern for production apps.

2. **Privy for auth + wallet** — One SDK handles both OAuth login AND wallet creation. No MetaMask, no seed phrases. Users log in with Google and instantly have a Solana wallet.

3. **Chart initialization pattern** — Chart is created once on mount, data is fetched separately and updated via `setData()`. This avoids destroying/recreating the chart on every token switch.

4. **Memo-wrapped components** — TokenList, TradePanel, and TokenChart use `React.memo` to prevent unnecessary re-renders during price polling.

## Environment Variables

```bash
NEXT_PUBLIC_PRIVY_APP_ID=    # Privy app ID (required for auth)
PRIVY_APP_SECRET=            # Privy server secret (for future server auth)
NEXT_PUBLIC_ALCHEMY_RPC_URL= # Solana RPC endpoint
CODEX_API_KEY=               # Codex GraphQL API key (required for market data)
NEXT_PUBLIC_SUPABASE_URL=    # Supabase project URL (for user persistence)
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anon key
```


Every feature listed above is functional code, not a mockup. The charts are real TradingView charts. The prices are live from Codex. The swaps execute on Solana mainnet.
