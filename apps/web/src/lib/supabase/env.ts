export function sanitizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;

  // Keep only printable ASCII to prevent invalid fetch headers from copied keys.
  let cleaned = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 31 && code < 127) {
      cleaned += value.charAt(i);
    }
  }

  cleaned = cleaned.trim();

  while (
    cleaned.startsWith('"') ||
    cleaned.startsWith("'") ||
    cleaned.endsWith('"') ||
    cleaned.endsWith("'")
  ) {
    if (cleaned.startsWith('"') || cleaned.startsWith("'")) {
      cleaned = cleaned.slice(1);
    }
    if (cleaned.endsWith('"') || cleaned.endsWith("'")) {
      cleaned = cleaned.slice(0, -1);
    }
    cleaned = cleaned.trim();
  }

  return cleaned || undefined;
}

export function isJWT(str: string): boolean {
  const parts = str.split(".");
  return parts.length === 3 && parts.every((part) => /^[a-zA-Z0-9_-]+$/.test(part));
}

export function maskSecret(secret: string | undefined): string {
  if (!secret) return "undefined";
  if (secret.length <= 12) return "***";
  return `${secret.slice(0, 8)}...${secret.slice(-4)}`;
}

export function validateSupabaseEnv(
  url: string | undefined,
  key: string | undefined
): { isValid: boolean; error?: string } {
  if (!url) {
    return { isValid: false, error: "عنوان Supabase URL غير متوفر في متغيرات البيئة." };
  }
  if (!key) {
    return { isValid: false, error: "مفتاح Supabase Publishable Key غير متوفر في متغيرات البيئة." };
  }

  if (!url.startsWith("https://")) {
    return { isValid: false, error: "عنوان Supabase URL غير صالح ويجب أن يبدأ بـ https://." };
  }

  const isValidKey = key.startsWith("sb_publishable_") || isJWT(key);
  if (!isValidKey) {
    return {
      isValid: false,
      error: "مفتاح Supabase غير صالح. يجب أن يبدأ بـ sb_publishable_ أو يكون رمز JWT صالحًا.",
    };
  }

  return { isValid: true };
}

export function getSupabasePublicEnv() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const url = sanitizeEnvValue(rawUrl);
  const key = sanitizeEnvValue(rawKey);

  const validation = validateSupabaseEnv(url, key);

  const isConfigured = Boolean(
    url && key && !url.includes("your-project") && !key.includes("your_key")
  );

  const enabled = isConfigured && validation.isValid;

  if (isConfigured && !validation.isValid) {
    console.error(
      `Supabase environment validation failed: ${validation.error} ` +
        `(URL: ${maskSecret(url)}, Key: ${maskSecret(key)})`
    );
  }

  return {
    url,
    key,
    enabled,
    error: enabled ? undefined : validation.error,
  };
}
