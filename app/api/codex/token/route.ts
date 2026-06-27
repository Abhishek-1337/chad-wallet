import { NextRequest } from "next/server";

const CODEX_GRAPHQL = "https://graph.codex.io/graphql";
const SOLANA_NETWORK = 1399811149;

const TOKEN_QUERY = `
  query Token($input: TokenInput!) {
    token(input: $input) {
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
      mintable
      freezable
      isMintableValid
      isFreezableValid
      top10HoldersPercent
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
        address
        name
        symbol
        networkId
        circulatingSupply
        totalSupply
        imageThumbUrl
        imageSmallUrl
        imageLargeUrl
        imageBannerUrl
        description
      }
      launchpad {
        launchpadName
        graduationPercent
        poolAddress
        completedAt
        completed
        migratedAt
        migrated
        migratedPoolAddress
        launchpadProtocol
        launchpadIconUrl
        category
      }
      extrema {
        athPrice
        athPriceTimestamp
        atlPrice
        atlPriceTimestamp
      }
    }
  }
`;

export async function GET(req: NextRequest) {
  const apiKey = process.env.CODEX_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "CODEX_API_KEY not configured" }, { status: 500 });
  }

  const address = req.nextUrl.searchParams.get("address");
  if (!address) {
    return Response.json({ error: "Missing address param" }, { status: 400 });
  }

  const res = await fetch(CODEX_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query: TOKEN_QUERY,
      variables: { input: { address, networkId: SOLANA_NETWORK } },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json({ error: `Codex error: ${res.status}`, details: text }, { status: res.status });
  }

  const json = await res.json();
  if (json.errors) {
    return Response.json({ error: json.errors[0]?.message }, { status: 400 });
  }

  return Response.json(json.data?.token || null);
}
