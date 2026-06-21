"use client";

import { useState } from "react";
import { Database, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { AuthButtons } from "@/components/auth-buttons";
import type { Category, Tool } from "@/lib/types";

type Props = {
  isAdmin: boolean;
  userEmail: string | null;
  tools: Tool[];
  categories: Category[];
};

export function AdminPanel({ isAdmin, userEmail, tools, categories }: Props) {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function runAction(path: string, options?: RequestInit) {
    setBusy(path);
    setMessage("");
    try {
      const response = await fetch(path, options);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "فشلت العملية.");
      setMessage(payload.message ?? "تمت العملية بنجاح.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فشلت العملية.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">لوحة التحكم</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">الإدارة والنسخ الاحتياطي</h1>
          <p className="mt-2 text-sm text-zinc-500">الحساب الحالي: {userEmail ?? "غير مسجل"}</p>
        </div>
        <AuthButtons />
      </div>

      {!isAdmin && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950 dark:text-amber-50">
          <h2 className="font-black">تحتاج صلاحية أدمن</h2>
          <p className="mt-2 leading-7">
            بعد تسجيل الدخول ببريد <span className="font-mono">omarsamawah@gmail.com</span> شغّل أمر Admin bootstrap
            الموجود آخر ملف `supabase/migrations/0001_init.sql` من Supabase SQL Editor.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="الأدوات والدروس" value={tools.length} icon={Database} />
        <Metric label="التصنيفات" value={categories.length} icon={FileSpreadsheet} />
        <Metric label="أدوات" value={tools.filter((tool) => tool.type === "tool").length} icon={Upload} />
        <Metric label="تعلم" value={tools.filter((tool) => tool.type === "learn").length} icon={Download} />
        <Metric label="GitHub" value={tools.filter((tool) => tool.type === "github").length} icon={Database} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <ActionCard
          title="استيراد بيانات Base44"
          description="يدخل seed JSON المنظف إلى Supabase. يتطلب أدمن."
          button="استيراد"
          icon={Upload}
          disabled={!isAdmin || busy !== ""}
          loading={busy === "/api/admin/import-seed"}
          onClick={() => runAction("/api/admin/import-seed", { method: "POST" })}
        />
        <ActionCard
          title="Backup إلى Google Sheets"
          description="يرسل الأدوات المنشورة إلى Google Sheets إذا كانت env جاهزة."
          button="تشغيل Backup"
          icon={FileSpreadsheet}
          disabled={!isAdmin || busy !== ""}
          loading={busy === "/api/backups/google-sheets"}
          onClick={() => runAction("/api/backups/google-sheets", { method: "POST" })}
        />
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-xl font-black">تصدير الملفات</h2>
          <p className="mt-2 min-h-14 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            حمل نسخة CSV أو Excel من البيانات الحالية.
          </p>
          <div className="mt-5 flex gap-2">
            <a href="/api/export?format=csv" className="rounded-md bg-muted px-4 py-2 text-sm font-black">
              CSV
            </a>
            <a href="/api/export?format=xlsx" className="rounded-md bg-primary px-4 py-2 text-sm font-black text-primary-foreground">
              Excel
            </a>
          </div>
        </div>
      </div>

      {message && <p className="mt-6 rounded-md bg-muted p-4 text-sm font-bold">{message}</p>}
    </section>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="text-sm font-bold text-zinc-500">{label}</div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  button,
  icon: Icon,
  disabled,
  loading,
  onClick,
}: {
  title: string;
  description: string;
  button: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <Icon className="h-6 w-6 text-primary" />
      <h2 className="mt-3 text-xl font-black">{title}</h2>
      <p className="mt-2 min-h-14 text-sm leading-7 text-zinc-600 dark:text-zinc-300">{description}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-primary-foreground disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {button}
      </button>
    </div>
  );
}
