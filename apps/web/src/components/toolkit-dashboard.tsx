"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Code2, ExternalLink, Filter, Search, Star, Zap, Pencil } from "lucide-react";
import type { Category, Tool, ToolType } from "@/lib/types";
import { searchTools } from "@/lib/tool-search";
import { formatPricing, typeLabel } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Props = {
  tools: Tool[];
  categories: Category[];
  title: string;
  subtitle: string;
  defaultType?: ToolType;
  initialIsAdmin?: boolean;
};

const ALL_CATEGORIES = "الكل";

const sortOptions = [
  { value: "recent", label: "الأحدث" },
  { value: "name", label: "أبجديًا" },
  { value: "featured", label: "المميزة" },
  { value: "pricing", label: "المجانية أولًا" },
];

export function ToolkitDashboard({ tools, categories, title, subtitle, defaultType, initialIsAdmin = false }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [type, setType] = useState<ToolType | "all">(defaultType ?? "all");
  const [pricing, setPricing] = useState("all");
  const [sort, setSort] = useState("recent");
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    async function checkAdmin(user: { id: string; email?: string | null } | null) {
      if (!user || !supabase) {
        setIsAdmin(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setIsAdmin(profile?.role === "admin");
    }

    supabase.auth.getUser().then(({ data }) => {
      checkAdmin(data.user).catch(console.error);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session?.user ?? null).catch(console.error);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [initialIsAdmin]);

  const filtered = useMemo(() => {
    const baseTools = tools
      .filter((tool) => (type === "all" ? true : tool.type === type))
      .filter((tool) => (category === ALL_CATEGORIES ? true : tool.category === category))
      .filter((tool) => (pricing === "all" ? true : tool.pricing === pricing));

    const searchedTools = query.trim() ? searchTools(baseTools, query) : baseTools;

    if (query.trim()) return searchedTools;

    return searchedTools.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "ar");
      if (sort === "featured") return Number(b.is_featured) - Number(a.is_featured);
      if (sort === "pricing") return a.pricing.localeCompare(b.pricing);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tools, type, category, pricing, query, sort]);

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-8 md:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-bold text-primary">
            <Zap className="h-4 w-4" />
            AI Toolkit Hub
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight md:text-6xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-zinc-600 dark:text-zinc-300">
            {subtitle}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="text-sm font-bold text-zinc-500">المحتوى الحالي</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            <Metric label="كل النتائج" value={tools.length} />
            <Metric label="أدوات" value={tools.filter((tool) => tool.type === "tool").length} />
            <Metric label="تعلم" value={tools.filter((tool) => tool.type === "learn").length} />
            <Metric label="GitHub" value={tools.filter((tool) => tool.type === "github").length} />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_160px_160px]">
          <label className="relative block">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث بالاسم، الوصف، الدومين، أو الوسوم"
              className="h-12 w-full rounded-md border border-border bg-background pr-10 pl-3 text-sm font-semibold outline-none focus:border-primary"
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 rounded-md border border-border bg-background px-3 text-sm font-bold"
          >
            <option>{ALL_CATEGORIES}</option>
            {categories.map((item) => (
              <option key={item.slug} value={item.name_ar}>
                {item.name_ar}
              </option>
            ))}
          </select>
          <select
            value={pricing}
            onChange={(event) => setPricing(event.target.value)}
            className="h-12 rounded-md border border-border bg-background px-3 text-sm font-bold"
          >
            <option value="all">كل الأسعار</option>
            <option value="free">مجاني</option>
            <option value="freemium">Freemium</option>
            <option value="paid">مدفوع</option>
            <option value="unknown">غير محدد</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 rounded-md border border-border bg-background px-3 text-sm font-bold"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setType(type === "tool" ? "all" : "tool")}
            className={`h-10 rounded-md px-4 text-sm font-extrabold ${
              type === "tool" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}
          >
            أدوات
          </button>
          <button
            type="button"
            onClick={() => setType(type === "learn" ? "all" : "learn")}
            className={`h-10 rounded-md px-4 text-sm font-extrabold ${
              type === "learn" ? "bg-accent text-white" : "bg-muted"
            }`}
          >
            تعلم
          </button>
          <button
            type="button"
            onClick={() => setType(type === "github" ? "all" : "github")}
            className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-extrabold ${
              type === "github" ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950" : "bg-muted"
            }`}
          >
            <Code2 className="h-4 w-4" />
            GitHub
          </button>
          <span className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500">
            <Filter className="h-4 w-4" />
            {filtered.length} نتيجة
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {filtered.map((tool) => (
          <ToolCard key={tool.id} tool={tool} isAdmin={isAdmin} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <p className="font-bold">لا توجد نتائج مطابقة. جرّب تعديل الفلاتر أو كلمات البحث.</p>
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-xs font-bold text-zinc-500">{label}</div>
    </div>
  );
}

function ToolCard({ tool, isAdmin }: { tool: Tool; isAdmin: boolean }) {
  const [favoriteState, setFavoriteState] = useState<"idle" | "saving" | "done">("idle");
  const searchChips = Array.from(new Set([...(tool.use_cases ?? []), ...(tool.tags ?? [])])).slice(0, 3);

  async function favorite() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      alert("أضف إعدادات Supabase لتفعيل المفضلة.");
      return;
    }
    setFavoriteState("saving");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("سجّل الدخول أولًا.");
      setFavoriteState("idle");
      return;
    }
    await supabase.from("favorites").upsert({ user_id: user.id, tool_id: tool.id });
    setFavoriteState("done");
  }

  return (
    <article className="group flex min-h-[270px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="relative flex h-24 items-center justify-center border-b border-border"
        style={{ backgroundColor: tool.category_color ?? "#14b8a6" }}
      >
        {tool.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.image_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/85 text-lg font-black text-zinc-900">
            {(tool.name_en || tool.name).slice(0, 2).toUpperCase()}
          </div>
        )}
        {tool.is_featured && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-amber-300 px-2 py-1 text-[11px] font-black text-zinc-900">
            <Star className="h-3 w-3 fill-current" />
            مميز
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-black">{tool.category ?? "أخرى"}</span>
          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-black">{formatPricing(tool.pricing)}</span>
          <span className="rounded-md bg-muted px-2 py-1 text-[11px] font-black">{typeLabel(tool.type)}</span>
        </div>
        <h2 className="mt-2 line-clamp-1 text-lg font-black">{tool.name}</h2>
        <p className="mt-1.5 line-clamp-2 min-h-[40px] text-xs leading-5 text-zinc-600 dark:text-zinc-300">
          {tool.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {searchChips.map((tag) => (
            <span key={tag} className="rounded bg-background px-2 py-0.5 text-[11px] font-semibold text-zinc-500">
              {tag}
            </span>
          ))}
        </div>
        {tool.type === "github" && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
            <span className="rounded-md bg-muted px-2 py-1">{tool.github_stars?.toLocaleString() ?? 0} stars</span>
            <span className="rounded-md bg-muted px-2 py-1">{tool.github_language || "Repo"}</span>
          </div>
        )}
        <div className="mt-auto flex gap-1.5 pt-3">
          <a
            href={tool.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-xs font-black text-primary-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            زيارة
          </a>
          {isAdmin && (
            <a
              href={`/admin/edit/${tool.id}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-primary hover:bg-muted"
              title="تعديل الأداة"
            >
              <Pencil className="h-3.5 w-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={favorite}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card"
            title="إضافة للمفضلة"
          >
            <Bookmark className={`h-3.5 w-3.5 ${favoriteState === "done" ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
