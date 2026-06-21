import { NextResponse } from "next/server";
import seed from "@/data/seed-data.json";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  const { supabase, user, isAdmin } = await getCurrentUserAndProfile();
  if (!supabase) return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  if (!user || !isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .upsert(seed.categories, { onConflict: "slug" })
    .select("id,slug,name_ar");

  if (categoryError) return NextResponse.json({ error: categoryError.message }, { status: 400 });

  const categoryBySlug = new Map(categories?.map((category) => [category.slug, category]) ?? []);
  const rows = seed.tools.map((tool) => {
    const category = categoryBySlug.get(tool.category_slug);
    return {
      legacy_id: tool.legacy_id,
      name: tool.name,
      name_en: tool.name_en,
      description: tool.description,
      type: tool.type,
      category_id: category?.id ?? null,
      category_name: tool.category,
      url: tool.url,
      normalized_url: tool.normalized_url,
      domain: tool.domain,
      image_url: tool.image_url,
      favicon_url: tool.favicon_url,
      pricing: tool.pricing,
      tags: tool.tags,
      use_cases: tool.use_cases ?? [],
      libraries: tool.libraries ?? [],
      notes: tool.notes,
      github_owner: tool.github_owner ?? null,
      github_repo: tool.github_repo ?? null,
      github_full_name: tool.github_full_name ?? null,
      github_stars: tool.github_stars ?? null,
      github_forks: tool.github_forks ?? null,
      github_language: tool.github_language ?? null,
      github_license: tool.github_license ?? null,
      github_topics: tool.github_topics ?? [],
      github_pushed_at: tool.github_pushed_at ?? null,
      status: "published",
      is_featured: tool.is_featured,
      usage_count: tool.usage_count,
      favorite_count: tool.favorite_count,
      average_rating: tool.average_rating,
      review_count: tool.review_count,
      sort_order: tool.sort_order,
      created_by: user.id,
      created_by_email: tool.created_by_email ?? user.email,
      created_at: tool.created_at,
      updated_at: tool.updated_at,
    };
  });

  const { error } = await supabase.from("tools").upsert(rows, { onConflict: "legacy_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("activity_logs").insert({
    actor_id: user.id,
    actor_email: user.email,
    action_type: "import",
    details: `Imported ${rows.length} cleaned tools from Base44 CSV exports`,
  });

  return NextResponse.json({ message: `تم استيراد ${rows.length} سجلًا بنجاح.` });
}
