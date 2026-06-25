import { NextRequest } from "next/server";

const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "quote") {
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const slippageBps = searchParams.get("slippageBps") || "50";

    if (!inputMint || !outputMint || !amount) {
      return Response.json(
        { error: "Missing required params: inputMint, outputMint, amount" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });

    const res = await fetch(`${JUPITER_QUOTE_API}/quote?${params}`);
    if (!res.ok) {
      return Response.json(
        { error: `Jupiter API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return Response.json(data);
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${JUPITER_QUOTE_API}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return Response.json(
      { error: `Jupiter swap error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
