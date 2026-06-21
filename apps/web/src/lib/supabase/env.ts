export function sanitizeEnvValue(value: string | undefined): string | undefined {
  if (!value) return undefined;

  // 1. Remove all control characters (0x00-0x1F, 0x7F) and any non-ASCII characters (> 127)
  let cleaned = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 31 && code < 127) {
      cleaned += value.charAt(i);
    }
  }

  cleaned = cleaned.trim();

  // 2. Remove leading/trailing quotes (single or double) recursively
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
    return { isValid: false, error: "Ø¹Ù†ÙˆØ§Ù† Supabase URL ØºÙŠØ± Ù…ØªÙˆÙØ± ÙÙŠ Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø©." };
  }
  if (!key) {
    return { isValid: false, error: "Ù…ÙØªØ§Ø­ Supabase Publishable Key ØºÙŠØ± Ù…ØªÙˆÙØ± ÙÙŠ Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ø¨ÙŠØ¦Ø©." };
  }

  if (!url.startsWith("https://")) {
    return { isValid: false, error: "Ø¹Ù†ÙˆØ§Ù† Supabase URL ØºÙŠØ± ØµØ§Ù„Ø­ (ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ¨Ø¯Ø£ Ø¨Ù€ https://)." };
  }

  const isValidKey = key.startsWith("sb_publishable_") || isJWT(key);
  if (!isValidKey) {
    return {
      isValid: false,
      error: "Ù…ÙØªØ§Ø­ Supabase ØºÙŠØ± ØµØ§Ù„Ø­ (ÙŠØ¬Ø¨ Ø£Ù† ÙŠØ¨Ø¯Ø£ Ø¨Ù€ sb_publishable_ Ø£Ùˆ ÙŠÙƒÙˆÙ† Ø±Ù…Ø² JWT ØµØ§Ù„Ø­Ù‹Ø§).",
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
