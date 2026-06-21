import type { Tool } from "@/lib/types";

type Field = {
  value: unknown;
  weight: number;
};

const synonymGroups = [
  ["صور", "صوره", "صورة", "image", "images", "photo", "photos", "design", "تصميم", "رسم", "توليد صور"],
  ["فيديو", "video", "videos", "reels", "animation", "montage", "مونتاج", "تحريك"],
  ["كتابه", "كتابة", "محتوي", "محتوى", "copywriting", "writing", "content", "article", "blog"],
  ["برمجه", "برمجة", "كود", "coding", "code", "developer", "dev", "api", "github", "repo", "repository"],
  ["واتساب", "whatsapp", "wa", "messaging", "رسائل", "شات", "chat"],
  ["صوت", "audio", "voice", "speech", "tts", "stt", "podcast", "تعليق صوتي"],
  ["تلخيص", "summary", "summarize", "summarization", "notes", "ملخص", "ملاحظات"],
  ["بحث", "search", "research", "web search", "seo", "تحليل", "analysis"],
  ["ترجمه", "ترجمة", "translate", "translation", "localization"],
  ["سوشيال", "social", "linkedin", "twitter", "x", "facebook", "instagram", "marketing", "تسويق"],
  ["ايميل", "email", "mail", "newsletter", "cold email", "بريد"],
  ["pdf", "document", "documents", "docs", "ملفات", "مستندات", "ورد", "word", "excel", "sheets"],
  ["agent", "agents", "وكيل", "وكلاء", "automation", "اتمته", "أتمتة", "workflow", "n8n"],
  ["rag", "vector", "embedding", "memory", "ذاكره", "ذاكرة", "معرفه", "معرفة"],
  ["موقع", "website", "web", "landing", "page", "clone", "frontend", "ui", "ux"],
];

const synonymIndex = new Map<string, string[]>();

for (const group of synonymGroups) {
  const normalized = Array.from(new Set(group.map(normalizeSearchText).filter(Boolean)));
  for (const term of normalized) {
    synonymIndex.set(term, normalized);
  }
}

export function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function expandSearchQuery(query: string): string[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const terms = new Set<string>([normalized, ...normalized.split(" ").filter((part) => part.length > 1)]);

  for (const term of Array.from(terms)) {
    for (const synonym of synonymIndex.get(term) ?? []) {
      terms.add(synonym);
    }
  }

  return Array.from(terms).filter(Boolean);
}

export function scoreToolForQuery(tool: Tool, query: string): number {
  const terms = expandSearchQuery(query);
  if (terms.length === 0) return 0;

  const fields: Field[] = [
    { value: tool.name, weight: 120 },
    { value: tool.name_en, weight: 110 },
    { value: tool.category, weight: 70 },
    { value: tool.category_slug, weight: 55 },
    { value: tool.description, weight: 38 },
    { value: tool.domain, weight: 32 },
    { value: tool.github_full_name, weight: 55 },
    { value: tool.github_owner, weight: 36 },
    { value: tool.github_repo, weight: 48 },
    { value: tool.github_language, weight: 28 },
    { value: tool.pricing, weight: 18 },
    { value: typeSearchLabel(tool.type), weight: 32 },
    { value: pricingSearchLabel(tool.pricing), weight: 20 },
    ...toFields(tool.tags, 62),
    ...toFields(tool.use_cases, 72),
    ...toFields(tool.libraries, 46),
    ...toFields(tool.github_topics, 52),
    { value: tool.notes, weight: 18 },
  ];

  let score = 0;
  for (const field of fields) {
    const normalizedField = normalizeSearchText(field.value);
    if (!normalizedField) continue;

    for (const term of terms) {
      score += scoreField(normalizedField, term, field.weight);
    }
  }

  return Math.round(score);
}

export function searchTools(tools: Tool[], query: string): Tool[] {
  const normalized = normalizeSearchText(query);
  if (!normalized) return tools;

  return tools
    .map((tool) => ({ tool, score: scoreToolForQuery(tool, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (Number(b.tool.is_featured) !== Number(a.tool.is_featured)) {
        return Number(b.tool.is_featured) - Number(a.tool.is_featured);
      }
      return new Date(b.tool.created_at).getTime() - new Date(a.tool.created_at).getTime();
    })
    .map((item) => item.tool);
}

function scoreField(field: string, term: string, weight: number): number {
  if (!term) return 0;
  if (field === term) return weight * 2.4;
  if (field.startsWith(term)) return weight * 1.8;
  if (field.includes(term)) return weight;

  const fieldTokens = field.split(" ");
  const termTokens = term.split(" ");

  let score = 0;
  for (const termToken of termTokens) {
    if (termToken.length <= 1) continue;
    for (const fieldToken of fieldTokens) {
      if (fieldToken === termToken) score += weight * 0.9;
      else if (fieldToken.startsWith(termToken)) score += weight * 0.65;
      else if (fieldToken.includes(termToken)) score += weight * 0.45;
      else if (isCloseToken(fieldToken, termToken)) score += weight * 0.28;
    }
  }
  return score;
}

function isCloseToken(left: string, right: string): boolean {
  if (left.length < 4 || right.length < 4) return false;
  if (Math.abs(left.length - right.length) > 2) return false;
  return levenshtein(left, right) <= (Math.min(left.length, right.length) >= 7 ? 2 : 1);
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[right.length];
}

function toFields(values: string[] | undefined, weight: number): Field[] {
  return (values ?? []).map((value) => ({ value, weight }));
}

function typeSearchLabel(type: string): string {
  if (type === "learn") return "تعلم learning course guide tutorial";
  if (type === "github") return "github repo repository code مكتبه مكتبة مشروع";
  return "اداه أداة tool app platform";
}

function pricingSearchLabel(pricing: string): string {
  if (pricing === "free") return "مجاني free";
  if (pricing === "paid") return "مدفوع paid";
  if (pricing === "freemium") return "freemium مجاني مدفوع";
  return "غير محدد unknown";
}
