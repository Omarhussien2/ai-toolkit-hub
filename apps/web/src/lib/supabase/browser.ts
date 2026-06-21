"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "./env";

let client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const env = getSupabasePublicEnv();
  if (!env.enabled || !env.url || !env.key) return null;
  try {
    client ??= createBrowserClient(env.url, env.key);
    return client;
  } catch (error) {
    console.error("Failed to initialize Supabase browser client:", error);
    return null;
  }
}
