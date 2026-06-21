"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Trash2, WandSparkles, ArrowLeft } from "lucide-react";
import type { Category, MetadataResult, Pricing, ToolType, Tool } from "@/lib/types";

type Props = {
  tool: Tool;
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

export function EditToolForm({ tool, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [metadata, setMetadata] = useState<MetadataResult | null>(null);
  
  const [form, setForm] = useState<FormState>({
    name: tool.name || "",
    name_en: tool.name_en || "",
    description: tool.description || "",
    type: tool.type || "tool",
    category: tool.category || tool.category_name || "أخرى",
    url: tool.url || "",
    image_url: tool.image_url || "",
    favicon_url: tool.favicon_url || "",
    pricing: tool.pricing || "free",
    tags: (tool.tags || []).join(", "),
    use_cases: (tool.use_cases || []).join(", "),
    libraries: (tool.libraries || []).join(", "),
    notes: tool.notes || "",
    github_owner: tool.github_owner || "",
    github_repo: tool.github_repo || "",
    github_full_name: tool.github_full_name || "",
    github_stars: tool.github_stars ?? null,
    github_forks: tool.github_forks ?? null,
    github_language: tool.github_language || "",
    github_license: tool.github_license || "",
    github_topics: (tool.github_topics || []).join(", "),
    github_pushed_at: tool.github_pushed_at || "",
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

  async function updateTool(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/tools/${tool.id}`, {
        method: "PUT",
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
      if (!response.ok) throw new Error(payload.error ?? "تعذر تحديث الأداة.");
      
      setMessage("تم حفظ التعديلات بنجاح.");
      router.push("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر التحديث.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTool() {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الكارت نهائيًا؟")) {
      return;
    }
    setDeleting(true);
    setMessage("");
    try {
      const response = await fetch(`/api/tools/${tool.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "تعذر حذف الأداة.");

      setMessage("تم حذف الأداة بنجاح.");
      router.push("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر الحذف.");
      setDeleting(false);
    }
  }

  function splitList(value: string) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          الرجوع للخلف
        </button>

        <form onSubmit={updateTool} className="rounded-lg border border-border bg-card p-5 shadow-sm">
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

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || deleting}
              className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-sm font-black text-primary-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              حفظ التعديلات
            </button>

            <button
              type="button"
              onClick={deleteTool}
              disabled={saving || deleting}
              className="inline-flex h-12 items-center gap-2 rounded-md bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-5 text-sm font-black disabled:opacity-60"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              حذف الكارت نهائيًا
            </button>
          </div>
        </form>
      </div>

      <aside className="rounded-lg border border-border bg-card p-5 shadow-sm self-start">
        <h2 className="text-lg font-black">المعاينة السريعة</h2>
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
            <p className="text-xs font-bold text-primary">{metadata?.domain || tool.domain || "domain"}</p>
            <h3 className="mt-2 line-clamp-2 text-xl font-black">{form.name || "اسم الأداة"}</h3>
            <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {form.description || "الوصف سيظهر هنا"}
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
