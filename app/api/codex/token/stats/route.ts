import { NextRequest } from "next/server";

const CODEX_GRAPHQL = "https://graph.codex.io/graphql";
const SOLANA_NETWORK = 1399811149;

const DETAILED_STATS_QUERY = `
  query DetailedTokenStats($networkId: Int!, $tokenAddress: String!) {
    getDetailedTokenStats(
      networkId: $networkId
      tokenAddress: $tokenAddress
      statsType: FILTERED
    ) {
      stats_min5   { statsUsd { volume { change } } }
      stats_hour1  { statsUsd { volume { change } } }
      stats_hour4  { statsUsd { volume { change } } }
      stats_day1   { statsUsd { volume { change } } }
    }
  }
`;

const TOKEN_BARS_QUERY = `
  query GetTokenBars($symbol: String!, $from: Int!, $to: Int!, $resolution: String!, $countback: Int) {
    getTokenBars(symbol: $symbol, from: $from, to: $to, resolution: $resolution, countback: $countback) {
      t
      buyers
      buys
      buyVolume
      sellers
      sells
      sellVolume
    }
  }
`;

const TIMEFRAME_CONFIG: Record<string, { resolution: string; fromOffset: number; countback: number }> = {
  "5M": { resolution: "5", fromOffset: 3600, countback: 12 },
  "1H": { resolution: "60", fromOffset: 86400, countback: 24 },
  "4H": { resolution: "240", fromOffset: 86400, countback: 6 },
  "1D": { resolution: "1D", fromOffset: 604800, countback: 7 },
};

async function codexFetch(query: string, variables: Record<string, unknown>, apiKey: string) {
  const res = await fetch(CODEX_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: apiKey },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.CODEX_API_KEY;
  if (!apiKey) return Response.json({ error: "CODEX_API_KEY not configured" }, { status: 500 });

  const address = req.nextUrl.searchParams.get("address");
  const timeframe = req.nextUrl.searchParams.get("tf") || "1H";
  if (!address) return Response.json({ error: "Missing address param" }, { status: 400 });

  const tf = TIMEFRAME_CONFIG[timeframe] || TIMEFRAME_CONFIG["1H"];
  const now = Math.floor(Date.now() / 1000);
  const symbol = `${address}:${SOLANA_NETWORK}`;

  try {
    const [statsData, barsData] = await Promise.all([
      codexFetch(DETAILED_STATS_QUERY, { networkId: SOLANA_NETWORK, tokenAddress: address }, apiKey),
      codexFetch(TOKEN_BARS_QUERY, {
        symbol,
        from: now - tf.fromOffset,
        to: now,
        resolution: tf.resolution,
        countback: tf.countback,
      }, apiKey),
    ]);

    const stats = statsData?.getDetailedTokenStats;
    const bars = barsData?.getTokenBars;

    let totalBuys = 0;
    let totalSells = 0;
    let totalBuyVolume = 0;
    let totalSellVolume = 0;
    let totalBuyers = 0;
    let totalSellers = 0;

    if (bars?.buyVolume) {
      for (let i = 0; i < bars.buyVolume.length; i++) {
        totalBuys += bars.buys?.[i] || 0;
        totalSells += bars.sells?.[i] || 0;
        totalBuyVolume += parseFloat(bars.buyVolume[i]) || 0;
        totalSellVolume += parseFloat(bars.sellVolume[i]) || 0;
        totalBuyers += bars.buyers?.[i] || 0;
        totalSellers += bars.sellers?.[i] || 0;
      }
    }

    const allPriceChanges = {
      "5M": stats?.stats_min5?.statsUsd?.volume?.change ?? null,
      "1H": stats?.stats_hour1?.statsUsd?.volume?.change ?? null,
      "4H": stats?.stats_hour4?.statsUsd?.volume?.change ?? null,
      "1D": stats?.stats_day1?.statsUsd?.volume?.change ?? null,
    };

    return Response.json({
      priceChanges: allPriceChanges,
      selectedTimeframe: timeframe,
      buys: totalBuys,
      sells: totalSells,
      buyVolume: totalBuyVolume,
      sellVolume: totalSellVolume,
      buyers: totalBuyers,
      sellers: totalSellers,
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
