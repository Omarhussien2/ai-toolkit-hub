import type { Tool, ToolType } from "@/lib/types";
import { normalizeSearchText } from "@/lib/tool-search";

type UseCaseRule = {
  labels: string[];
  keywords: string[];
};

const rules: UseCaseRule[] = [
  {
    labels: ["إنشاء صور", "تحرير الصور", "تصميم بصري"],
    keywords: ["image", "images", "photo", "photos", "picture", "design", "logo", "visual", "midjourney", "ideogram", "صوره", "صور", "تصميم"],
  },
  {
    labels: ["إنشاء فيديو", "تحرير الفيديو", "تحريك المحتوى"],
    keywords: ["video", "reels", "storyboard", "animation", "motion", "runway", "ltx", "sora", "wan", "فيديو", "مونتاج", "تحريك"],
  },
  {
    labels: ["تحويل صوت لنص", "تعليق صوتي", "معالجة الصوت"],
    keywords: ["audio", "voice", "speech", "transcribe", "tts", "stt", "podcast", "music", "whisper", "elevenlabs", "صوت"],
  },
  {
    labels: ["كتابة محتوى", "تحسين النصوص", "أفكار تسويقية"],
    keywords: ["write", "writing", "copy", "content", "blog", "article", "caption", "newsletter", "email", "كتابه", "كتابة", "محتوي", "محتوى"],
  },
  {
    labels: ["برمجة وتطوير", "تكامل API", "أتمتة تقنية"],
    keywords: ["code", "coding", "developer", "api", "sdk", "github", "repo", "repository", "typescript", "javascript", "python", "برمجه", "برمجة"],
  },
  {
    labels: ["أتمتة واتساب", "إدارة الرسائل", "تجارب WhatsApp Web"],
    keywords: ["whatsapp", "whats", "messaging", "message", "baileys", "واتساب", "رسائل"],
  },
  {
    labels: ["بحث وتحليل", "جمع معلومات", "اكتشاف مصادر"],
    keywords: ["search", "research", "browser", "paper", "crawl", "scrape", "scraping", "web scraping", "serper", "بحث"],
  },
  {
    labels: ["تحليل بيانات", "تقارير وجداول", "استخراج رؤى"],
    keywords: ["data", "analytics", "analysis", "dashboard", "spreadsheet", "excel", "sheets", "report", "تحليل بيانات"],
  },
  {
    labels: ["إدارة إنتاجية", "تنظيم المهام", "حفظ الملاحظات"],
    keywords: ["productivity", "notes", "calendar", "task", "workspace", "notion", "organize", "إنتاجية", "انتاجيه"],
  },
  {
    labels: ["محادثة ذكية", "مساعد AI", "إجابات فورية"],
    keywords: ["chat", "assistant", "conversation", "bot", "claude", "chatgpt", "gemini", "qwen", "deepseek", "محادثه", "محادثة"],
  },
  {
    labels: ["تعلم ومراجع", "دروس وأدلة", "تطوير المهارات"],
    keywords: ["learn", "learning", "course", "tutorial", "guide", "awesome", "skills", "docs", "تعلم"],
  },
  {
    labels: ["وكلاء AI", "سير عمل ذكي", "أتمتة متعددة الخطوات"],
    keywords: ["agent", "agents", "workflow", "automation", "mcp", "n8n", "orchestration", "وكلاء", "وكيل", "أتمتة", "اتمته"],
  },
  {
    labels: ["ذاكرة ومعرفة", "RAG", "بحث دلالي"],
    keywords: ["rag", "embedding", "vector", "memory", "knowledge", "graph", "retrieval", "ذاكره", "ذاكرة"],
  },
  {
    labels: ["تسويق وسوشيال", "جدولة محتوى", "نشر متعدد المنصات"],
    keywords: ["marketing", "social", "linkedin", "instagram", "twitter", "facebook", "seo", "campaign", "تسويق", "سوشيال"],
  },
  {
    labels: ["مواقع وواجهات", "تصميم UI/UX", "قوالب Frontend"],
    keywords: ["website", "frontend", "ui", "ux", "react", "next", "template", "clone", "landing", "موقع", "واجهة", "واجهات"],
  },
  {
    labels: ["ملفات ومستندات", "PDF", "تحويل وتصدير"],
    keywords: ["pdf", "document", "documents", "docx", "word", "file", "export", "convert", "ملفات", "مستندات"],
  },
];

const categoryFallbacks: Record<string, string[]> = {
  media: ["إنشاء محتوى مرئي", "تحرير ميديا"],
  audio: ["معالجة الصوت", "تحويل صوت لنص"],
  productivity: ["إدارة إنتاجية", "تنظيم العمل"],
  agents: ["وكلاء AI", "أتمتة سير العمل"],
  platforms: ["منصة AI", "إدارة أدوات"],
  marketing: ["تسويق وسوشيال", "أفكار حملات"],
  development: ["برمجة وتطوير", "تكامل API"],
  design: ["تصميم بصري", "تصميم UI/UX"],
  writing: ["كتابة محتوى", "تحسين النصوص"],
  "data-analysis": ["تحليل بيانات", "تقارير وجداول"],
  research: ["بحث وتحليل", "جمع معلومات"],
  chat: ["محادثة ذكية", "مساعد AI"],
  learning: ["تعلم ومراجع", "تطوير المهارات"],
  github: ["مشاريع GitHub", "مراجع تقنية"],
};

export function enrichToolUseCases<T extends Tool>(tool: T): T {
  const inferred = inferToolUseCases(tool);
  return {
    ...tool,
    use_cases: uniqueList([...inferred, ...(tool.use_cases ?? [])]).slice(0, 10),
  };
}

export function inferToolUseCases(tool: Tool): string[] {
  const haystack = normalizeSearchText([
    tool.name,
    tool.name_en,
    tool.description,
    tool.category,
    tool.category_slug,
    tool.domain,
    tool.github_full_name,
    tool.github_language,
    ...(tool.tags ?? []),
    ...(tool.github_topics ?? []),
    ...(tool.libraries ?? []),
  ].filter(Boolean).join(" "));

  const matches: string[] = [];

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => haystack.includes(normalizeSearchText(keyword)))) {
      matches.push(...rule.labels);
    }
  }

  matches.push(...fallbackByCategory(tool.category_slug, tool.category));
  matches.push(...fallbackByType(tool.type));

  return uniqueList(matches).slice(0, 8);
}

function fallbackByCategory(slug?: string | null, name?: string | null): string[] {
  const normalizedSlug = normalizeSearchText(slug);
  const normalizedName = normalizeSearchText(name);
  return categoryFallbacks[normalizedSlug] ?? categoryFallbacks[normalizedName] ?? [];
}

function fallbackByType(type: ToolType): string[] {
  if (type === "github") return ["مشاريع GitHub", "مراجع تقنية"];
  if (type === "learn") return ["تعلم ومراجع", "تطوير المهارات"];
  return ["اكتشاف أدوات", "تجربة حلول AI"];
}

function uniqueList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = normalizeSearchText(trimmed);
    if (!trimmed || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}
