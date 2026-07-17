import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/env";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(config.supabase.url, config.supabase.serviceKey);
  }
  return client;
}
