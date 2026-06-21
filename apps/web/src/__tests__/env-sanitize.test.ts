import { sanitizeEnvValue, validateSupabaseEnv } from "../lib/supabase/env";

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ Test passed: ${name}`);
  } catch (error) {
    console.error(`❌ Test failed: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// 1. Sanitize BOM
runTest("Sanitize BOM U+FEFF", () => {
  const value = "\uFEFFhttps://example.supabase.co";
  const cleaned = sanitizeEnvValue(value);
  if (cleaned !== "https://example.supabase.co") {
    throw new Error(`Expected clean URL, got: "${cleaned}"`);
  }
});

// 2. Sanitize quotes
runTest("Sanitize single/double quotes", () => {
  const value1 = '"https://example.supabase.co"';
  const value2 = "'https://example.supabase.co'";
  if (sanitizeEnvValue(value1) !== "https://example.supabase.co") {
    throw new Error(`Double quotes not stripped correctly: ${sanitizeEnvValue(value1)}`);
  }
  if (sanitizeEnvValue(value2) !== "https://example.supabase.co") {
    throw new Error(`Single quotes not stripped correctly: ${sanitizeEnvValue(value2)}`);
  }
});

// 3. Sanitize mixed quotes and BOM
runTest("Sanitize mixed quotes and BOM", () => {
  const value = '"\uFEFFhttps://example.supabase.co"';
  const cleaned = sanitizeEnvValue(value);
  if (cleaned !== "https://example.supabase.co") {
    throw new Error(`Mixed quotes/BOM not stripped: "${cleaned}"`);
  }
});

// 4. Sanitize trailing space
runTest("Sanitize trailing/leading space", () => {
  const value = "  https://example.supabase.co   ";
  const cleaned = sanitizeEnvValue(value);
  if (cleaned !== "https://example.supabase.co") {
    throw new Error(`Spaces not stripped: "${cleaned}"`);
  }
});

// 5. Sanitize zero-width space and non-ASCII chars
runTest("Sanitize zero-width space and non-ASCII", () => {
  const value = "sb_\u200Bpublishable_2H3dryk3VxJzd";
  const cleaned = sanitizeEnvValue(value);
  if (cleaned !== "sb_publishable_2H3dryk3VxJzd") {
    throw new Error(`Zero-width space or non-ASCII not stripped: "${cleaned}"`);
  }
});

runTest("Sanitize Arabic characters", () => {
  const value = "https://example.supabase.co/عربي";
  const cleaned = sanitizeEnvValue(value);
  if (cleaned !== "https://example.supabase.co/") {
    throw new Error(`Arabic characters not stripped: "${cleaned}"`);
  }
});

// 6. Validate Supabase URL
runTest("Validate Supabase URL scheme", () => {
  const url1 = "http://example.supabase.co";
  const url2 = "https://example.supabase.co";
  const key = "sb_publishable_12345678901234567890";
  
  if (validateSupabaseEnv(url1, key).isValid) {
    throw new Error("HTTP URL should be invalid");
  }
  if (!validateSupabaseEnv(url2, key).isValid) {
    throw new Error(`HTTPS URL should be valid, got error: ${validateSupabaseEnv(url2, key).error}`);
  }
});

// 7. Validate Supabase Key format
runTest("Validate Supabase key format", () => {
  const url = "https://example.supabase.co";
  const key1 = "sb_publishable_12345678901234567890";
  const key2 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.signature";
  const key3 = "invalid_key_format";
  
  if (!validateSupabaseEnv(url, key1).isValid) {
    throw new Error(`New publishable key should be valid, got: ${validateSupabaseEnv(url, key1).error}`);
  }
  if (!validateSupabaseEnv(url, key2).isValid) {
    throw new Error(`JWT key should be valid, got: ${validateSupabaseEnv(url, key2).error}`);
  }
  if (validateSupabaseEnv(url, key3).isValid) {
    throw new Error("Invalid key format should be rejected");
  }
});

console.log("All environment verification tests passed successfully!");
