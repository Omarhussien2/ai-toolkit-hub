export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return {
    url,
    key,
    enabled: Boolean(url && key && !url.includes("your-project") && !key.includes("your_key")),
  };
}
