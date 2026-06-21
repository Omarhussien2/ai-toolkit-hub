import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "./env";

export async function getSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env.enabled || !env.url || !env.key) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; Route Handlers can.
        }
      },
    },
  });
}

export async function getCurrentUserAndProfile() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, profile: null, isAdmin: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { supabase, user: null, profile: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    profile,
    isAdmin: profile?.role === "admin" || user.email === "omarsamawah@gmail.com",
  };
}
