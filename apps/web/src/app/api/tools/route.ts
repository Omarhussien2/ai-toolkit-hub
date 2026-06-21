import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";
import { getDomain, normalizeUrl, slugify } from "@/lib/utils";

export const runtime = "nodejs";

const toolSchema = z.object({
  name: z.string().min(1),
  name_en: z.string().optional().nullable(),
  description: z.string().min(1),
  type: z.enum(["tool", "learn", "github"]).default("tool"),
  category: z.string().min(1).default("أخرى"),
  url: z.string().url(),
  image_url: z.string().url().optional().or(z.literal("")).nullable(),
  favicon_url: z.string().url().optional().or(z.literal("")).nullable(),
  pricing: z.enum(["free", "paid", "freemium", "unknown"]).default("unknown"),
  tags: z.array(z.string()).default([]),
  use_cases: z.array(z.string()).default([]),
  libraries: z.array(z.string()).default([]),
  notes: z.string().optional().nullable(),
  github_owner: z.string().optional().nullable(),
  github_repo: z.string().optional().nullable(),
  github_full_name: z.string().optional().nullable(),
  github_stars: z.number().int().nonnegative().optional().nullable(),
  github_forks: z.number().int().nonnegative().optional().nullable(),
  github_language: z.string().optional().nullable(),
  github_license: z.string().optional().nullable(),
  github_topics: z.array(z.string()).default([]),
  github_pushed_at: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const { supabase, user, isAdmin } = await getCurrentUserAndProfile();
  if (!supabase) return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  if (!user || !isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const parsed = toolSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const input = parsed.data;
  const categorySlug = slugify(input.category);
  const { data: category } = await supabase
    .from("categories")
    .upsert(
      {
        slug: categorySlug,
        name_ar: input.category,
        name_en: input.category,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  const normalized = normalizeUrl(input.url);
  const domain = getDomain(normalized);
  const { data, error } = await supabase
    .from("tools")
    .insert({
      name: input.name,
      name_en: input.name_en || null,
      description: input.description,
      type: input.type,
      category_id: category?.id ?? null,
      category_name: input.category,
      url: input.url,
      normalized_url: normalized,
      domain,
      image_url: input.image_url || null,
      favicon_url: input.favicon_url || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null),
      pricing: input.pricing,
      tags: input.tags,
      use_cases: input.use_cases,
      libraries: input.libraries,
      notes: input.notes || null,
      github_owner: input.github_owner || null,
      github_repo: input.github_repo || null,
      github_full_name: input.github_full_name || null,
      github_stars: input.github_stars ?? null,
      github_forks: input.github_forks ?? null,
      github_language: input.github_language || null,
      github_license: input.github_license || null,
      github_topics: input.github_topics,
      github_pushed_at: input.github_pushed_at || null,
      status: "published",
      created_by: user.id,
      created_by_email: user.email,
    })
    .select("id,name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    actor_email: user.email,
    action_type: "create",
    tool_id: data.id,
    tool_name: data.name,
    details: "Created from capture flow",
  });

  revalidatePath("/", "layout");

  return NextResponse.json({ message: "تم حفظ الأداة.", tool: data });
}
