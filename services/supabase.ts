import { createClient } from "@supabase/supabase-js";
import type { Analysis } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * A single shared client. Supabase is optional in Phase 1 — if the env vars
 * are missing the app still runs, and history persistence simply no-ops with a
 * clear console warning. Phase 3 wires reads/writes into the analysis flow.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export async function saveAnalysis(
  row: Omit<Analysis, "id" | "created_at">
): Promise<Analysis | null> {
  if (!supabase) {
    console.warn(
      "[supabase] not configured — skipping saveAnalysis. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
    return null;
  }
  const { data, error } = await supabase
    .from("analyses")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("[supabase] saveAnalysis failed:", error.message);
    return null;
  }
  return data as Analysis;
}

export async function getAnalyses(limit = 50): Promise<Analysis[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[supabase] getAnalyses failed:", error.message);
    return [];
  }
  return (data ?? []) as Analysis[];
}
