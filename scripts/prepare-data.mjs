import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { githubSeedProjects } from "./github-seed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

function objectsFromCsv(csv) {
  const [headers, ...rows] = parseCsv(csv);
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
  );
}

function normalizeUrl(url) {
  try {
    const parsed = new URL(url.trim());
    parsed.hash = "";
    if (parsed.pathname === "/") parsed.pathname = "/";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

function parseArray(value) {
  if (!value || value === "[]") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

const categoryMap = new Map([
  ["ميديا", { name_en: "Media", color: "#ef4444" }],
  ["صوت", { name_en: "Audio", color: "#14b8a6" }],
  ["إنتاجية", { name_en: "Productivity", color: "#22c55e" }],
  ["وكلاء", { name_en: "Agents", color: "#eab308" }],
  ["منصات", { name_en: "Platforms", color: "#38bdf8" }],
  ["تسويق", { name_en: "Marketing", color: "#f97316" }],
  ["برمجة", { name_en: "Development", color: "#6366f1" }],
  ["تصميم", { name_en: "Design", color: "#ec4899" }],
  ["كتابة", { name_en: "Writing", color: "#84cc16" }],
  ["تحليل بيانات", { name_en: "Data analysis", color: "#06b6d4" }],
  ["بحث", { name_en: "Research", color: "#64748b" }],
  ["محادثة", { name_en: "Chat", color: "#a855f7" }],
  ["تعلم", { name_en: "Learning", color: "#f59e0b" }],
  ["GitHub", { name_en: "GitHub", color: "#24292f" }],
  ["أخرى", { name_en: "Other", color: "#78716c" }],
]);

function cleanPricing(value) {
  if (value === "مجاني") return "free";
  if (value === "مدفوع") return "paid";
  if (value?.toLowerCase() === "freemium") return "freemium";
  return "unknown";
}

const toolsCsv = await readFile(path.join(root, "Tool_export.csv"), "utf8");
const favoritesCsv = await readFile(path.join(root, "Favorite_export.csv"), "utf8").catch(
  () => "",
);
const activityCsv = await readFile(path.join(root, "ActivityLog_export.csv"), "utf8").catch(
  () => "",
);

const rawTools = objectsFromCsv(toolsCsv);
const seen = new Set();
const tools = [];

for (const row of rawTools) {
  const name = row.name?.trim();
  const url = row.url?.trim();
  const description = row.description?.trim();
  if (!name || !url || !description) continue;

  const normalized_url = normalizeUrl(url);
  const dedupeKey = `${slugify(name)}::${normalized_url.toLowerCase()}`;
  if (seen.has(dedupeKey)) continue;
  seen.add(dedupeKey);

  const category = row.category?.trim() || "أخرى";
  if (!categoryMap.has(category)) {
    categoryMap.set(category, { name_en: category, color: "#78716c" });
  }

  let domain = "";
  try {
    domain = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    domain = "";
  }

  tools.push({
    legacy_id: row.id || null,
    name,
    name_en: row.name_en?.trim() || null,
    description,
    type: row.type === "Learn" ? "learn" : "tool",
    category,
    category_slug: slugify(category || "other"),
    url,
    normalized_url,
    domain,
    image_url: row.image_url?.trim() || null,
    favicon_url: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : null,
    pricing: cleanPricing(row.pricing),
    tags: parseArray(row.tags),
    notes: row.notes?.trim() || null,
    related_tools: parseArray(row.related_tools),
    is_featured: row.is_featured === "true",
    usage_count: Number(row.usage_count || 0),
    favorite_count: Number(row.favorite_count || 0),
    average_rating: Number(row.average_rating || 0),
    review_count: Number(row.review_count || 0),
    sort_order: Number(row.sort_order || 0),
    created_by_email: row.created_by || null,
    created_at: row.created_date || new Date().toISOString(),
    updated_at: row.updated_date || row.created_date || new Date().toISOString(),
  });
}

for (const project of githubSeedProjects) {
  const normalized_url = normalizeUrl(project.url);
  const dedupeKey = `github::${project.github_full_name.toLowerCase()}`;
  if (seen.has(dedupeKey)) continue;
  seen.add(dedupeKey);

  tools.push({
    legacy_id: project.legacy_id,
    name: project.name,
    name_en: project.name_en,
    description: project.description,
    type: "github",
    category: "GitHub",
    category_slug: "github",
    url: project.url,
    normalized_url,
    domain: "github.com",
    image_url: null,
    favicon_url: "https://github.githubassets.com/favicons/favicon.svg",
    pricing: "free",
    tags: project.tags,
    use_cases: project.use_cases,
    libraries: project.libraries,
    notes: project.notes,
    related_tools: [],
    github_owner: project.github_owner,
    github_repo: project.github_repo,
    github_full_name: project.github_full_name,
    github_stars: project.github_stars,
    github_forks: null,
    github_language: project.github_language,
    github_license: project.github_license,
    github_topics: project.tags.filter((tag) => tag !== "github"),
    github_pushed_at: null,
    is_featured: project.github_stars >= 50000,
    usage_count: 0,
    favorite_count: 0,
    average_rating: 0,
    review_count: 0,
    sort_order: 0,
    created_by_email: "seed",
    created_at: "2026-06-21T00:00:00.000Z",
    updated_at: "2026-06-21T00:00:00.000Z",
  });
}

const categories = Array.from(categoryMap.entries()).map(([name_ar, meta], index) => ({
  slug: slugify(name_ar || "other"),
  name_ar,
  name_en: meta.name_en,
  color: meta.color,
  sort_order: index,
}));

const favorites = favoritesCsv ? objectsFromCsv(favoritesCsv) : [];
const activity_logs = activityCsv ? objectsFromCsv(activityCsv) : [];

await mkdir(path.join(root, "apps", "web", "src", "data"), { recursive: true });
await mkdir(path.join(root, "data"), { recursive: true });

const payload = {
  generated_at: new Date().toISOString(),
  counts: {
    source_tools: rawTools.length,
    tools: tools.length,
    categories: categories.length,
    favorites: favorites.length,
    activity_logs: activity_logs.length,
  },
  categories,
  tools,
};

await writeFile(
  path.join(root, "apps", "web", "src", "data", "seed-data.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);
await writeFile(
  path.join(root, "data", "seed-summary.json"),
  `${JSON.stringify(payload.counts, null, 2)}\n`,
  "utf8",
);

console.log(payload.counts);
