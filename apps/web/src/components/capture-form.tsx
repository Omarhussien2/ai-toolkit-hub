"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, WandSparkles } from "lucide-react";
import type { Category, MetadataResult, Pricing, ToolType } from "@/lib/types";

type Props = {
  initialUrl: string;
  initialTitle: string;
  categories: Category[];
};

type FormState = {
  name: string;
  name_en: string;
  description: string;
  type: ToolType;
  category: string;
  url: string;
  image_url: string;
  favicon_url: string;
  pricing: Pricing;
  tags: string;
  use_cases: string;
  libraries: string;
  notes: string;
  github_owner: string;
  github_repo: string;
  github_full_name: string;
  github_stars: number | null;
  github_forks: number | null;
  github_language: string;
  github_license: string;
  github_topics: string;
  github_pushed_at: string;
};

export function CaptureForm({ initialUrl, initialTitle, categories }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  const [form, setForm] = useState<FormState>({
    name: initialTitle || "",
    name_en: "",
    description: "",
    type: "tool",
    category: "أخرى",
    url: initialUrl,
    image_url: "",
    favicon_url: "",
    pricing: "free",
    tags: "",
    use_cases: "",
    libraries: "",
    notes: "",
    github_owner: "",
    github_repo: "",
    github_full_name: "",
    github_stars: null,
    github_forks: null,
    github_language: "",
    github_license: "",
    github_topics: "",
    github_pushed_at: "",
  });

  const canRead = useMemo(() => form.url.trim().length > 5, [form.url]);

  async function readMetadata() {
    if (!canRead) return;
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(form.url)}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "تعذر قراءة الرابط.");
      const result = payload.metadata as MetadataResult;
      setMetadata(result);
      setForm((current) => ({
        ...current,
        name: current.name || result.title,
        description: current.description || result.description,
        type: result.detected_type || current.type,
        category: result.suggested_category || current.category,
        url: result.canonical_url || current.url,
        image_url: result.image_url || current.image_url,
        favicon_url: result.favicon_url || current.favicon_url,
        tags: current.tags || result.suggested_tags.join(", "),
        use_cases: current.use_cases || (result.use_cases ?? []).join(", "),
        libraries: current.libraries || (result.libraries ?? []).join(", "),
        github_owner: result.github_owner || current.github_owner,
        github_repo: result.github_repo || current.github_repo,
        github_full_name: result.github_full_name || current.github_full_name,
        github_stars: result.github_stars ?? current.github_stars,
        github_forks: result.github_forks ?? current.github_forks,
        github_language: result.github_language || current.github_language,
        github_license: result.github_license || current.github_license,
        github_topics: current.github_topics || (result.github_topics ?? []).join(", "),
        github_pushed_at: result.github_pushed_at || current.github_pushed_at,
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر قراءة الرابط.");
    } finally {
      setLoading(false);
    }
  }

  async function saveTool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: splitList(form.tags),
          use_cases: splitList(form.use_cases),
          libraries: splitList(form.libraries),
          github_topics: splitList(form.github_topics),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "تعذر الحفظ.");
      setMessage("تم حفظ الرابط بنجاح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر الحفظ.");
    } finally {
      setSaving(false);
    }
  }

  function splitList(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  useEffect(() => {
    if (!initialUrl) return;
    const timeout = window.setTimeout(() => {
      void readMetadata();
    }, 0);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={saveTool} className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="الرابط" className="md:col-span-2">
            <div className="flex gap-2">
              <input
                dir="ltr"
                value={form.url}
                onChange={(event) => setForm({ ...form, url: event.target.value })}
                className="h-12 flex-1 rounded-md border border-border bg-background px-3 text-left text-sm outline-none focus:border-primary"
                placeholder="https://example.com"
                required
              />
              <button
                type="button"
                onClick={readMetadata}
                disabled={loading || !canRead}
                className="inline-flex h-12 items-center gap-2 rounded-md bg-muted px-4 text-sm font-black disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                قراءة
              </button>
            </div>
          </Field>

          <Field label="الاسم">
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              required
            />
          </Field>
          <Field label="الاسم الإنجليزي">
            <input
              value={form.name_en}
              onChange={(event) => setForm({ ...form, name_en: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="الوصف" className="md:col-span-2">
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className="min-h-28 w-full rounded-md border border-border bg-background p-3 text-sm leading-7 outline-none focus:border-primary"
              required
            />
          </Field>
          <Field label="النوع">
            <select
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value as ToolType })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm font-bold"
            >
              <option value="tool">أداة</option>
              <option value="learn">تعلم</option>
              <option value="github">GitHub</option>
            </select>
          </Field>
          <Field label="التصنيف">
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm font-bold"
            >
              {categories.map((item) => (
                <option key={item.slug} value={item.name_ar}>
                  {item.name_ar}
                </option>
              ))}
            </select>
          </Field>
          <Field label="التسعير">
            <select
              value={form.pricing}
              onChange={(event) => setForm({ ...form, pricing: event.target.value as Pricing })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm font-bold"
            >
              <option value="free">مجاني</option>
              <option value="freemium">Freemium</option>
              <option value="paid">مدفوع</option>
              <option value="unknown">غير محدد</option>
            </select>
          </Field>
          <Field label="الوسوم">
            <input
              value={form.tags}
              onChange={(event) => setForm({ ...form, tags: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="ai, design, productivity"
            />
          </Field>
          <Field label="Use cases">
            <input
              value={form.use_cases}
              onChange={(event) => setForm({ ...form, use_cases: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="RAG, automation, UI reference"
            />
          </Field>
          <Field label="Libraries">
            <input
              value={form.libraries}
              onChange={(event) => setForm({ ...form, libraries: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              placeholder="React, TypeScript, MCP"
            />
          </Field>
          {form.type === "github" && (
            <div className="grid gap-4 rounded-lg border border-border bg-muted p-4 md:col-span-2 md:grid-cols-2">
              <Field label="GitHub repo">
                <input
                  dir="ltr"
                  value={form.github_full_name}
                  onChange={(event) => setForm({ ...form, github_full_name: event.target.value })}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-left text-sm outline-none focus:border-primary"
                  placeholder="owner/repo"
                />
              </Field>
              <Field label="Language">
                <input
                  value={form.github_language}
                  onChange={(event) => setForm({ ...form, github_language: event.target.value })}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Stars">
                <input
                  type="number"
                  min="0"
                  value={form.github_stars ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, github_stars: event.target.value ? Number(event.target.value) : null })
                  }
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Topics">
                <input
                  value={form.github_topics}
                  onChange={(event) => setForm({ ...form, github_topics: event.target.value })}
                  className="h-12 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  placeholder="agent-skills, rag, mcp"
                />
              </Field>
            </div>
          )}
          <Field label="رابط الصورة" className="md:col-span-2">
            <input
              dir="ltr"
              value={form.image_url}
              onChange={(event) => setForm({ ...form, image_url: event.target.value })}
              className="h-12 w-full rounded-md border border-border bg-background px-3 text-left text-sm outline-none focus:border-primary"
            />
          </Field>
          <Field label="ملاحظات" className="md:col-span-2">
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              className="min-h-20 w-full rounded-md border border-border bg-background p-3 text-sm leading-7 outline-none focus:border-primary"
            />
          </Field>
        </div>

        {message && <p className="mt-4 rounded-md bg-muted p-3 text-sm font-bold">{message}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-sm font-black text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ في MyToolkit
        </button>
      </form>

      <aside className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-black">المعاينة</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          {form.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image_url} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center bg-muted text-sm font-bold text-zinc-500">
              لا توجد صورة
            </div>
          )}
          <div className="p-4">
            <p className="text-xs font-bold text-primary">{metadata?.domain || "domain"}</p>
            <h3 className="mt-2 line-clamp-2 text-xl font-black">{form.name || "اسم الأداة"}</h3>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {form.description || "الوصف سيظهر هنا بعد قراءة الرابط."}
            </p>
            {form.type === "github" && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                <span className="rounded-md bg-muted px-2 py-1">{form.github_full_name || "GitHub repo"}</span>
                <span className="rounded-md bg-muted px-2 py-1">{form.github_language || "Language"}</span>
                <span className="rounded-md bg-muted px-2 py-1">{form.github_stars ?? 0} stars</span>
                <span className="rounded-md bg-muted px-2 py-1">{form.libraries || "Libraries"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-black">{label}</span>
      {children}
    </label>
  );
}
