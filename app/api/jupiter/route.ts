import { NextRequest } from "next/server";

const BASE_URL = "https://api.jup.ag/swap/v2";

function getHeaders() {
  const apiKey = process.env.NEXT_PRODUCER_JUPITER_API_KEY;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["x-api-key"] = apiKey;
  return headers;
}

async function proxyError(res: Response) {
  const body = await res.text();
  let json: Record<string, unknown>;
  try { json = JSON.parse(body); } catch { json = { error: body }; }
  return Response.json(json, { status: res.status });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "order") {
    const inputMint = searchParams.get("inputMint");
    const outputMint = searchParams.get("outputMint");
    const amount = searchParams.get("amount");
    const taker = searchParams.get("taker");

    if (!inputMint || !outputMint || !amount || !taker) {
      return Response.json(
        { error: "Missing required params: inputMint, outputMint, amount, taker" },
        { status: 400 },
      );
    }

    const params = new URLSearchParams({ inputMint, outputMint, amount, taker });
    const slippageBps = searchParams.get("slippageBps");
    if (slippageBps) params.set("slippageBps", slippageBps);

    const res = await fetch(`${BASE_URL}/order?${params}`, { headers: getHeaders() });
    if (!res.ok) return proxyError(res);

    const data = await res.json();
    return Response.json(data);
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.signedTransaction && body.requestId) {
    const res = await fetch(`${BASE_URL}/execute`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        signedTransaction: body.signedTransaction,
        requestId: body.requestId,
      }),
    });

    if (!res.ok) return proxyError(res);

    const data = await res.json();
    return Response.json(data);
  }

  return Response.json({ error: "Invalid request body" }, { status: 400 });
}
