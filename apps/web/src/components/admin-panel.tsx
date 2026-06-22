import { Database, Download, FileSpreadsheet, Upload } from "lucide-react";
import type { Category, Tool } from "@/lib/types";
import { ADMIN_EMAIL } from "@/lib/constants";

type Props = {
  isAdmin: boolean;
  userEmail: string | null;
  tools: Tool[];
  categories: Category[];
};

export function AdminPanel({ isAdmin, userEmail, tools, categories }: Props) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">لوحة التحكم</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">الإدارة والنسخ الاحتياطي</h1>
          <p className="mt-2 text-sm text-zinc-500">الحساب الحالي: {userEmail ?? "غير مسجل"}</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950 dark:text-amber-50">
          <h2 className="font-black">{userEmail ? "هذا الحساب ليس أدمن" : "سجّل الدخول بالبريد الإداري"}</h2>
          {userEmail ? (
            <p className="mt-2 leading-7">
              أنت مسجل حاليًا ببريد <span className="font-mono">{userEmail}</span>. اخرج ثم ادخل ببريد{" "}
              <span className="font-mono">{ADMIN_EMAIL}</span> لفتح أدوات الإدارة.
            </p>
          ) : (
            <p className="mt-2 leading-7">
              اكتب بريد <span className="font-mono">{ADMIN_EMAIL}</span> في خانة الدخول بالأعلى، ثم اضغط
              رابط الدخول الذي سيصلك على البريد. لا تحتاج أي إعداد يدوي إضافي.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="الأدوات والدروس" value={tools.length} icon={Database} />
        <Metric label="التصنيفات" value={categories.length} icon={FileSpreadsheet} />
        <Metric label="أدوات" value={tools.filter((tool) => tool.type === "tool").length} icon={Upload} />
        <Metric label="تعلم" value={tools.filter((tool) => tool.type === "learn").length} icon={Download} />
        <Metric label="GitHub" value={tools.filter((tool) => tool.type === "github").length} icon={Database} />
      </div>

      <div className="mt-6">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm md:w-1/3">
          <Download className="h-6 w-6 text-primary" />
          <h2 className="mt-3 text-xl font-black">تصدير الملفات</h2>
          <p className="mt-2 min-h-14 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            حمل نسخة CSV أو Excel من البيانات الحالية.
          </p>
          <div className="mt-5 flex gap-2">
            <a href="/api/export?format=csv" className="rounded-md bg-muted px-4 py-2 text-sm font-black transition-colors hover:bg-muted/80">
              CSV
            </a>
            <a href="/api/export?format=xlsx" className="rounded-md bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Excel
            </a>
          </div>
        </div>
      </div>
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
