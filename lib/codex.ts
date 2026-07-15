const SOLANA_NETWORK = 1399811149;

async function gql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/codex/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Codex GraphQL error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data;
}

export interface CodexToken {
  address: string;
  name: string;
  symbol: string;
  logoUrl?: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  rank?: number;
}

export interface CodexHolder {
  address: string;
  percentage: number;
  balance: string;
}

export interface CodexSwap {
  walletAddress: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  timestamp: string;
  signature: string;
}

export interface TokenStats {
  price: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  priceChange24h: number;
  top10HoldersPercent: number;
}

const FILTER_TOKENS = `
  query FilterTokens(
    $filters: TokenFilters
    $rankings: [TokenRanking]
    $limit: Int
    $offset: Int
  ) {
    filterTokens(
      filters: $filters
      rankings: $rankings
      limit: $limit
      offset: $offset
    ) {
      count
      results {
        priceUSD
        marketCap
        volume24
        liquidity
        holders
        token {
          info {
            address
            name
            symbol
            networkId
            imageThumbUrl
          }
        }
      }
    }
  }
`;

const TOKEN = `
 query Token(
    $input: TokenInput
  ){
  token(
    input: $input
  ) {
    id
    address
    networkId
    name
    symbol
    decimals
    isScam
    creatorAddress
    createBlockNumber
    createTransactionHash
    createdAt
    exchanges {
      address
      color
      exchangeVersion
      iconUrl
      id
      name
      networkId
      tradeUrl
    }
    socialLinks {
      twitter
      telegram
      discord
      website
    }
    info {
      circulatingSupply
      totalSupply
      imageSmallUrl
      imageLargeUrl
      description
    }
  }
}`;

const GET_TOKEN_PRICES = `
  query GetTokenPrices($inputs: [GetPriceInput!]!) {
    getTokenPrices(inputs: $inputs) {
      address
      networkId
      priceUsd
      timestamp
    }
  }
`;

const GET_TOKEN_BARS = `
  query GetTokenBars(
    $symbol: String!
    $from: Int!
    $to: Int!
    $resolution: String!
    $countback: Int
  ) {
    getTokenBars(
      symbol: $symbol
      from: $from
      to: $to
      resolution: $resolution
      countback: $countback
    ) {
      t
      o
      h
      l
      c
      volume
      buyers
      buys
      buyVolume
      sellers
      sells
      sellVolume
      traders
      transactions
    }
  }
`;

const GET_TOKEN_EVENTS = `
  query GetTokenEvents(
    $query: EventsQueryInput!
    $limit: Int
  ) {
    getTokenEvents(query: $query, limit: $limit) {
      items {
        timestamp
        eventType
        eventDisplayType
        token0SwapValueUsd
        token1SwapValueUsd
        token0ValueBase
        token1ValueBase
        maker
        transactionHash
      }
    }
  }
`;

const HOLDERS_QUERY = `
  query Holders($input: HoldersInput!) {
    holders(input: $input) {
      count
      items {
        address
        balance
        shiftedBalance
        balanceUsd
      }
    }
  }
`;

const GET_DETAILED_TOKEN_STATS = `
  query DetailedTokenStats($tokenAddress: String!, $networkId: Int!) {
    getDetailedTokenStats(
      tokenAddress: $tokenAddress
      networkId: $networkId
      statsType: FILTERED
      durations: [day1]
    ) {
      stats_day1 {
        statsUsd {
          volume { currentValue }
          buyVolume { currentValue }
          sellVolume { currentValue }
          close { currentValue change }
          liquidity { currentValue }
        }
        statsNonCurrency {
          transactions { currentValue }
          traders { currentValue }
        }
      }
    }
  }
`;

const GET_TOKEN_SUPPLEMENTAL = `
  query TokenSupplemental($filters: TokenFilters!, $tokens: [String]) {
    filterTokens(filters: $filters, tokens: $tokens, limit: 1) {
      results {
        marketCap
        holders
        top10HoldersPercent
      }
    }
  }
`;

export async function getTokenInfo(address: string): Promise<any> {
  const data = await gql<{ token: any }>(TOKEN, {
    input: { address, networkId: SOLANA_NETWORK },
  });
  return data.token;
}

export async function getTrendingTokens(): Promise<CodexToken[]> {
  const data = await gql<{
    filterTokens: { results: any[] };
  }>(FILTER_TOKENS, {
    filters: {
      network: [SOLANA_NETWORK],
      liquidity: { gte: 10000 },
      potentialScam: false,
    },
    rankings: [{ attribute: "trendingScore24", direction: "DESC" }],
    limit: 25,
    offset: 0,
  });

  return (data.filterTokens?.results || []).map((r: any, i: number) => ({
    address: r.token?.info?.address || "",
    name: r.token?.info?.name || "",
    symbol: r.token?.info?.symbol || "",
    logoUrl: r.token?.info?.imageThumbUrl || undefined,
    price: r.priceUSD || 0,
    priceChange24h: 0,
    volume24h: r.volume24 || 0,
    marketCap: r.marketCap || 0,
    rank: i + 1,
  }));
}

export async function getTokenMetadata(address: string): Promise<CodexToken> {
  const data = await gql<{
    filterTokens: { results: any[] };
  }>(FILTER_TOKENS, {
    filters: {
      network: [SOLANA_NETWORK],
      tokens: [`${address}:${SOLANA_NETWORK}`],
    },
    limit: 1,
    offset: 0,
  });

  const r = data.filterTokens?.results?.[0];
  if (!r) throw new Error("Token not found");

  const priceData = await gql<{ getTokenPrices: any[] }>(GET_TOKEN_PRICES, {
    inputs: [{ address, networkId: SOLANA_NETWORK }],
  });
  const priceInfo = priceData.getTokenPrices?.[0];

  return {
    address: r.token?.info?.address || address,
    name: r.token?.info?.name || "",
    symbol: r.token?.info?.symbol || "",
    logoUrl: r.token?.info?.imageThumbUrl || undefined,
    price: priceInfo?.priceUsd || r.priceUSD || 0,
    priceChange24h: 0,
    volume24h: r.volume24 || 0,
    marketCap: r.marketCap || 0,
  };
}

export async function getTokenPrice(address: string): Promise<{ price: number; priceChange24h: number }> {
  const now = Math.floor(Date.now() / 1000);
  const yesterday = now - 86400;

  const [currentData, historicalData] = await Promise.all([
    gql<{ getTokenPrices: any[] }>(GET_TOKEN_PRICES, {
      inputs: [{ address, networkId: SOLANA_NETWORK }],
    }),
    gql<{ getTokenPrices: any[] }>(GET_TOKEN_PRICES, {
      inputs: [{ address, networkId: SOLANA_NETWORK, timestamp: yesterday }],
    }),
  ]);

  const currentPrice = currentData.getTokenPrices?.[0]?.priceUsd || 0;
  const historicalPrice = historicalData.getTokenPrices?.[0]?.priceUsd || 0;
  const priceChange24h = historicalPrice > 0 ? ((currentPrice - historicalPrice) / historicalPrice) * 100 : 0;

  return { price: currentPrice, priceChange24h };
}

function parseStr(val: string | null | undefined): number {
  if (val == null) return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

export async function getTokenStats(address: string): Promise<TokenStats | null> {
  try {
    const [detailed, supplemental] = await Promise.all([
      gql<{ getDetailedTokenStats: any }>(GET_DETAILED_TOKEN_STATS, {
        tokenAddress: address,
        networkId: SOLANA_NETWORK,
      }),
      gql<{ filterTokens: { results: any[] } }>(GET_TOKEN_SUPPLEMENTAL, {
        filters: {
          network: [SOLANA_NETWORK],
          potentialScam: false,
        },
        tokens: [`${address}:${SOLANA_NETWORK}`],
      }),
    ]);

    const day1 = detailed?.getDetailedTokenStats?.stats_day1;
    const usd = day1?.statsUsd;
    const nonCurrency = day1?.statsNonCurrency;

    const price = parseStr(usd?.close?.currentValue);
    const volume24h = parseStr(usd?.volume?.currentValue);
    const liquidity = parseStr(usd?.liquidity?.currentValue);
    // change is a decimal (-0.52 = -52%), convert to percentage
    const rawChange = usd?.close?.change;
    const priceChange24h = rawChange != null ? rawChange * 100 : 0;

    const sup = supplemental?.filterTokens?.results?.[0];

    return {
      price,
      marketCap: sup?.marketCap || 0,
      volume24h,
      liquidity,
      holders: sup?.holders || 0,
      priceChange24h,
      top10HoldersPercent: sup?.top10HoldersPercent || 0,
    };
  } catch {
    return null;
  }
}

export async function getTokenPrices(addresses: string[]): Promise<Map<string, number>> {
  if (addresses.length === 0) return new Map();
  const inputs = addresses.map((address) => ({ address, networkId: SOLANA_NETWORK }));
  const data = await gql<{ getTokenPrices: any[] }>(GET_TOKEN_PRICES, { inputs });
  const prices = new Map<string, number>();
  for (const p of data.getTokenPrices || []) {
    if (p.address) prices.set(p.address, p.priceUsd || 0);
  }
  return prices;
}

function resolutionFromInterval(interval: string): string {
  const map: Record<string, string> = {
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "4h": "240",
    "1d": "1D",
    "1w": "7D",
  };
  return map[interval] || "60";
}

function intervalToSeconds(interval: string): number {
  const map: Record<string, number> = {
    "1m": 60,
    "5m": 300,
    "15m": 900,
    "30m": 1800,
    "1h": 3600,
    "4h": 14400,
    "1d": 86400,
    "1w": 604800,
  };
  return map[interval] || 3600;
}

export async function getTokenOHLCV(address: string, interval = "1h", limit = 100) {
  const now = Math.floor(Date.now() / 1000);
  const resolution = resolutionFromInterval(interval);
  const symbol = `${address}:${SOLANA_NETWORK}`;

  const data = await gql<{
    getTokenBars: {
      t: number[];
      o: number[];
      h: number[];
      l: number[];
      c: number[];
      volume: (number | string)[];
    };
  }>(GET_TOKEN_BARS, {
    symbol,
    from: now - limit * intervalToSeconds(interval),
    to: now,
    resolution,
    countback: limit,
  });

  const bars = data.getTokenBars;
  if (!bars?.t) return [];

  return bars.t.map((t, i) => ({
    timestamp: t,
    open: bars.o[i],
    high: bars.h[i],
    low: bars.l[i],
    close: bars.c[i],
    volume: typeof bars.volume[i] === "string" ? parseFloat(bars.volume[i] as string) : bars.volume[i],
  }));
}

export async function getTokenSwaps(address: string, limit = 20): Promise<CodexSwap[]> {
  const data = await gql<{
    getTokenEvents: { items: any[] };
  }>(GET_TOKEN_EVENTS, {
    query: { address, networkId: SOLANA_NETWORK },
    limit,
  });

  return (data.getTokenEvents?.items || []).map((ev: any) => ({
    walletAddress: ev.maker || "",
    type: ev.eventDisplayType === "Buy" ? ("buy" as const) : ("sell" as const),
    amount: Number(ev.token0SwapValueUsd) || Number(ev.token1SwapValueUsd) || 0,
    price: Number(ev.token1SwapValueUsd) || 0,
    timestamp: ev.timestamp || "",
    signature: ev.transactionHash || "",
  }));
}

export async function getTokenHolders(address: string): Promise<CodexHolder[]> {
  const data = await gql<{
    holders: { items: any[] };
  }>(HOLDERS_QUERY, {
    input: {
      tokenAddress: address,
      networkId: SOLANA_NETWORK,
    },
  });

  const items = data.holders?.items || [];
  const totalBalance = items.reduce((sum: number, h: any) => sum + (parseFloat(h.balance) || 0), 0);

  return items.map((h: any) => ({
    address: h.address || "",
    percentage: totalBalance > 0 ? (parseFloat(h.balance) / totalBalance) * 100 : 0,
    balance: h.balance || "0",
  }));
}
