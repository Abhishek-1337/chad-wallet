const JUPITER_QUOTE_API = "https://quote-api.jup.ag/v6";
const JUPITER_SWAP_API = "https://quote-api.jup.ag/v6";

export interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  priceImpactPct: string;
  routePlan: any[];
  swapMode: string;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  prioritizationFee: any;
  dynamicSlippageReport: any;
  simulationError: any;
}

const SOL_MINT = "So11111111111111111111111111111111111111112";
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps = 50
): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: Math.floor(amount).toString(),
    slippageBps: slippageBps.toString(),
  });
  const res = await fetch(`${JUPITER_QUOTE_API}/quote?${params}`);
  if (!res.ok) throw new Error(`Jupiter quote error: ${res.status}`);
  return res.json();
}

export async function getSwapTransaction(
  quoteResponse: JupiterQuote,
  userPublicKey: string,
  wrapAndUnwrapSol = true,
  dynamicComputeUnitLimit = true,
  prioritizationFeeLamports: "auto" | number = "auto"
): Promise<JupiterSwapResponse> {
  const body = {
    quoteResponse,
    userPublicKey,
    wrapAndUnwrapSol,
    dynamicComputeUnitLimit,
    prioritizationFeeLamports,
  };
  const res = await fetch(`${JUPITER_SWAP_API}/swap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Jupiter swap error: ${res.status}`);
  return res.json();
}

export { SOL_MINT, USDC_MINT };
