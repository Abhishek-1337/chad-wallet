import { NextRequest } from "next/server";

const CODEX_GRAPHQL = "https://graph.codex.io/graphql";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CODEX_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "CODEX_API_KEY not configured" }, { status: 500 });
  }

  const body = await req.json();

  const res = await fetch(CODEX_GRAPHQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return Response.json({ error: `Codex GraphQL error: ${res.status}`, details: text }, { status: res.status });
  }

  const data = await res.json();
  return Response.json(data);
}
