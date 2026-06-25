const CODEX_BASE = "https://api.codex.io/v1";

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

async function fetchCodex(path: string, options?: RequestInit) {
  const res = await fetch(`${CODEX_BASE}${path}`, {
    ...options,
    headers: {
      "x-api-key": process.env.CODEX_API_KEY || "",
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`Codex API error: ${res.status}`);
  return res.json();
}

export async function getTrendingTokens(): Promise<CodexToken[]> {
  const data = await fetchCodex("/tokens/trending?networkId=1399811149");
  return data.data || data.tokens || data;
}

export async function getTokenMetadata(address: string): Promise<CodexToken> {
  const data = await fetchCodex(`/tokens/${address}`);
  return data.data || data;
}

export async function getTokenPrice(address: string): Promise<{ price: number; priceChange24h: number }> {
  const data = await fetchCodex(`/tokens/${address}/price`);
  return data.data || data;
}

export async function getTokenOHLCV(address: string, interval = "1h", limit = 100) {
  const data = await fetchCodex(`/tokens/${address}/ohlcv?interval=${interval}&limit=${limit}`);
  return data.data || data;
}

export async function getTokenSwaps(address: string, limit = 20): Promise<CodexSwap[]> {
  const data = await fetchCodex(`/tokens/${address}/swaps?limit=${limit}`);
  return data.data || data;
}

export async function getTokenHolders(address: string): Promise<CodexHolder[]> {
  const data = await fetchCodex(`/tokens/${address}/holders`);
  return data.data || data;
}
