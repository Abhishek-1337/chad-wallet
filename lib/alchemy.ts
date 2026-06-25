import { Connection, PublicKey } from "@solana/web3.js";

const RPC_URL = process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "";

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(RPC_URL, "confirmed");
  }
  return connection;
}

export async function getSolBalance(address: string): Promise<number> {
  const conn = getConnection();
  const pubkey = new PublicKey(address);
  const balance = await conn.getBalance(pubkey);
  return balance / 1e9;
}
