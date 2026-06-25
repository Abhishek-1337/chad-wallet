import { NextRequest } from "next/server";

const CODEX_BASE = "https://api.codex.io/v1";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiKey = process.env.CODEX_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "CODEX_API_KEY not configured" }, { status: 500 });
  }

  const pathStr = path.join("/");
  const url = new URL(_req.url);
  const queryString = url.search;
  const res = await fetch(`${CODEX_BASE}/${pathStr}${queryString}`, {
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return Response.json(
      { error: `Codex API error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  return Response.json(data);
}
