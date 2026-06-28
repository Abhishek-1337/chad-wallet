const BASE_URL = "https://api.jup.ag/swap/v2";

export interface OrderResponse {
  transaction: string | null;
  requestId: string;
  outAmount: string;
  router: string;
  mode: string;
  feeBps: number;
  feeMint: string;
  platformFee?: { amount: string; feeBps: number; feeMint: string };
  errorCode?: number;
  errorMessage?: string;
}

export interface ExecuteResponse {
  status: "Success" | "Failed";
  signature: string;
  code: number;
  inputAmountResult: string;
  outputAmountResult: string;
  error?: string;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function getOrder(
  inputMint: string,
  outputMint: string,
  amount: number,
  taker: string,
  slippageBps?: number,
): Promise<OrderResponse> {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: Math.floor(amount).toString(),
    taker,
  });
  if (slippageBps !== undefined) params.set("slippageBps", slippageBps.toString());

  const res = await fetch(`${BASE_URL}/order?${params}`);
  if (!res.ok) throw new Error(`Jupiter order error: ${res.status}`);
  return res.json();
}

export async function executeSwap(
  signedTransaction: string,
  requestId: string,
): Promise<ExecuteResponse> {
  const res = await fetch(`${BASE_URL}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signedTransaction, requestId }),
  });
  if (!res.ok) throw new Error(`Jupiter execute error: ${res.status}`);
  return res.json();
}

export { SOL_MINT, USDC_MINT };
