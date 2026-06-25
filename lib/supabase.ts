import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function upsertUser(privyId: string, walletAddress?: string, email?: string) {
  const { data, error } = await supabase.from("users").upsert(
    { privy_id: privyId, wallet_address: walletAddress, email },
    { onConflict: "privy_id" }
  ).select().single();
  if (error) throw error;
  return data;
}

export async function getUser(privyId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", privyId)
    .single();
  if (error) return null;
  return data;
}
