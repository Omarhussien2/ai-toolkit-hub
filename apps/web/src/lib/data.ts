import { createClient } from "@supabase/supabase-js";
import seed from "@/data/seed-data.json";
import type { Category, Tool, ToolType } from "@/lib/types";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

type SeedPayload = typeof seed;
type SupabaseToolRow = {
  id: string;
  legacy_id: string | null;
  name: string;
  name_en: string | null;
  description: string;
  type: ToolType;
  category_id: string | null;
  category_name: string | null;
  categories: {
    slug: string;
    name_ar: string;
    name_en: string | null;
    color: string;
    sort_order: number | null;
  } | null;
  url: string;
  normalized_url: string | null;
  domain: string | null;
  image_url: string | null;
  favicon_url: string | null;
  pricing: Tool["pricing"];
  tags: string[] | null;
  use_cases: string[] | null;
  libraries: string[] | null;
  notes: string | null;
  github_owner: string | null;
  github_repo: string | null;
  github_full_name: string | null;
  github_stars: number | null;
  github_forks: number | null;
  github_language: string | null;
  github_license: string | null;
  github_topics: string[] | null;
  github_pushed_at: string | null;
  status: Tool["status"];
  is_featured: boolean;
  usage_count: number | null;
  favorite_count: number | null;
  average_rating: number | string | null;
  review_count: number | null;
  sort_order: number | null;
  created_by_email: string | null;
  created_at: string;
  updated_at: string | null;
};

function mapSeedTool(tool: SeedPayload["tools"][number], index: number): Tool {
  const category = seed.categories.find((item) => item.slug === tool.category_slug);
  return {
    id: tool.legacy_id || `seed-${index}`,
    legacy_id: tool.legacy_id,
    name: tool.name,
    name_en: tool.name_en,
    description: tool.description,
    type: tool.type as ToolType,
    category: tool.category,
    category_slug: tool.category_slug,
    category_color: category?.color ?? "#14b8a6",
    url: tool.url,
    normalized_url: tool.normalized_url,
    domain: tool.domain,
    image_url: tool.image_url,
    favicon_url: tool.favicon_url,
    pricing: tool.pricing as Tool["pricing"],
    tags: tool.tags ?? [],
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
    created_by_email: tool.created_by_email,
    created_at: tool.created_at,
    updated_at: tool.updated_at,
  };
}

export function getSeedTools(type?: ToolType) {
  return seed.tools
    .map(mapSeedTool)
    .filter((tool) => (type ? tool.type === type : true))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getSeedCategories(): Category[] {
  return seed.categories;
}

function getPublicSupabaseClient() {
  const env = getSupabasePublicEnv();
  if (!env.enabled || !env.url || !env.key) return null;
  return createClient(env.url, env.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getTools(type?: ToolType) {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return getSeedTools(type);

  const query = supabase
    .from("tools")
    .select(
      "*, categories:category_id(slug,name_ar,name_en,color,sort_order)",
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (type) query.eq("type", type);

  const { data, error } = await query;
  if (error || !data) return getSeedTools(type);

  return (data as SupabaseToolRow[]).map((item) => ({
    id: item.id,
    legacy_id: item.legacy_id,
    name: item.name,
    name_en: item.name_en,
    description: item.description,
    type: item.type,
    category_id: item.category_id,
    category: item.categories?.name_ar ?? item.category_name ?? "أخرى",
    category_slug: item.categories?.slug,
    category_color: item.categories?.color ?? "#14b8a6",
    url: item.url,
    normalized_url: item.normalized_url,
    domain: item.domain,
    image_url: item.image_url,
    favicon_url: item.favicon_url,
    pricing: item.pricing,
    tags: item.tags ?? [],
    use_cases: item.use_cases ?? [],
    libraries: item.libraries ?? [],
    notes: item.notes,
    github_owner: item.github_owner,
    github_repo: item.github_repo,
    github_full_name: item.github_full_name,
    github_stars: item.github_stars,
    github_forks: item.github_forks,
    github_language: item.github_language,
    github_license: item.github_license,
    github_topics: item.github_topics ?? [],
    github_pushed_at: item.github_pushed_at,
    status: item.status,
    is_featured: item.is_featured,
    usage_count: item.usage_count ?? 0,
    favorite_count: item.favorite_count ?? 0,
    average_rating: Number(item.average_rating ?? 0),
    review_count: item.review_count ?? 0,
    sort_order: item.sort_order ?? 0,
    created_by_email: item.created_by_email,
    created_at: item.created_at,
    updated_at: item.updated_at,
  })) satisfies Tool[];
}

export async function getCategories() {
  const supabase = getPublicSupabaseClient();
  if (!supabase) return getSeedCategories();

  const { data, error } = await supabase
    .from("categories")
    .select("id,slug,name_ar,name_en,color,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return getSeedCategories();
  return data satisfies Category[];
}

export async function getToolById(id: string): Promise<Tool | null> {
  const supabase = getPublicSupabaseClient();
  if (!supabase) {
    const tool = seed.tools.find((item, index) => (item.legacy_id === id || `seed-${index}` === id));
    if (!tool) return null;
    const index = seed.tools.indexOf(tool);
    return mapSeedTool(tool, index);
  }

  const { data, error } = await supabase
    .from("tools")
    .select("*, categories:category_id(slug,name_ar,name_en,color,sort_order)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const item = data as SupabaseToolRow;
  return {
    id: item.id,
    legacy_id: item.legacy_id,
    name: item.name,
    name_en: item.name_en,
    description: item.description,
    type: item.type,
    category_id: item.category_id,
    category: item.categories?.name_ar ?? item.category_name ?? "أخرى",
    category_slug: item.categories?.slug,
    category_color: item.categories?.color ?? "#14b8a6",
    url: item.url,
    normalized_url: item.normalized_url,
    domain: item.domain,
    image_url: item.image_url,
    favicon_url: item.favicon_url,
    pricing: item.pricing,
    tags: item.tags ?? [],
    use_cases: item.use_cases ?? [],
    libraries: item.libraries ?? [],
    notes: item.notes,
    github_owner: item.github_owner,
    github_repo: item.github_repo,
    github_full_name: item.github_full_name,
    github_stars: item.github_stars,
    github_forks: item.github_forks,
    github_language: item.github_language,
    github_license: item.github_license,
    github_topics: item.github_topics ?? [],
    github_pushed_at: item.github_pushed_at,
    status: item.status,
    is_featured: item.is_featured,
    usage_count: item.usage_count ?? 0,
    favorite_count: item.favorite_count ?? 0,
    average_rating: Number(item.average_rating ?? 0),
    review_count: item.review_count ?? 0,
    sort_order: item.sort_order ?? 0,
    created_by_email: item.created_by_email,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}
