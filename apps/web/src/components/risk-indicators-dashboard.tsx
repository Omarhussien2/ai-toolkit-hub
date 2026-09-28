"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Flag,
  Gauge,
  Link2,
  ListChecks,
  ShieldAlert,
  Target,
  TrendingDown,
  TriangleAlert,
  Users,
} from "lucide-react";

type RegisterStatus = "updated" | "stale" | "missing" | "reviewed-empty";
type Severity = "critical" | "high" | "medium" | "low";
type ViewFilter = "all" | "attention" | "open-risks" | "unlinked";

type ProjectRiskSummary = {
  id: string;
  name: string;
  manager: string;
  department: string;
  registerStatus: RegisterStatus;
  lastReviewed: string;
  openRisks: number;
  closedRisks: number;
  openBySeverity: Record<Severity, number>;
  linkedMitigationTasks: number;
  unlinkedOpenRisks: number;
  activeChallenges: number;
  predictedChallenges: number;
  nextAction: string;
};

const TARGET_REGISTER_COVERAGE = 80;
const OPEN_RISK_WARNING_LINE = 40;

const projects: ProjectRiskSummary[] = [
  {
    id: "PMO-102",
    name: "منصة الخدمات الذكية",
    manager: "نورة القحطاني",
    department: "التحول الرقمي",
    registerStatus: "updated",
    lastReviewed: "20 يونيو 2026",
    openRisks: 3,
    closedRisks: 2,
    openBySeverity: { critical: 1, high: 1, medium: 1, low: 0 },
    linkedMitigationTasks: 4,
    unlinkedOpenRisks: 1,
    activeChallenges: 1,
    predictedChallenges: 1,
    nextAction: "ربط خطر تأخر التكامل بمهمة معالجة.",
  },
  {
    id: "PMO-118",
    name: "تحديث نظام الموارد",
    manager: "عبدالله المالكي",
    department: "الخدمات المؤسسية",
    registerStatus: "updated",
    lastReviewed: "18 يونيو 2026",
    openRisks: 4,
    closedRisks: 6,
    openBySeverity: { critical: 0, high: 2, medium: 1, low: 1 },
    linkedMitigationTasks: 7,
    unlinkedOpenRisks: 0,
    activeChallenges: 2,
    predictedChallenges: 2,
    nextAction: "متابعة تاريخ إغلاق مخاطر المورد الخارجي.",
  },
  {
    id: "PMO-121",
    name: "مستودع البيانات",
    manager: "ريم الحربي",
    department: "البيانات والتحليلات",
    registerStatus: "stale",
    lastReviewed: "30 مايو 2026",
    openRisks: 2,
    closedRisks: 1,
    openBySeverity: { critical: 1, high: 1, medium: 0, low: 0 },
    linkedMitigationTasks: 1,
    unlinkedOpenRisks: 2,
    activeChallenges: 1,
    predictedChallenges: 0,
    nextAction: "تحديث السجل وربط مخاطر جودة البيانات بمهام واضحة.",
  },
  {
    id: "PMO-127",
    name: "بوابة المستفيدين",
    manager: "فهد العتيبي",
    department: "تجربة المستفيد",
    registerStatus: "missing",
    lastReviewed: "لا يوجد",
    openRisks: 0,
    closedRisks: 0,
    openBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    linkedMitigationTasks: 0,
    unlinkedOpenRisks: 0,
    activeChallenges: 0,
    predictedChallenges: 0,
    nextAction: "إنشاء سجل مخاطر أو توثيق عدم وجود مخاطر حالية.",
  },
  {
    id: "PMO-134",
    name: "تطبيق الفرق الميدانية",
    manager: "سارة الشهري",
    department: "العمليات",
    registerStatus: "reviewed-empty",
    lastReviewed: "21 يونيو 2026",
    openRisks: 0,
    closedRisks: 3,
    openBySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
    linkedMitigationTasks: 2,
    unlinkedOpenRisks: 0,
    activeChallenges: 0,
    predictedChallenges: 0,
    nextAction: "لا توجد مخاطر مفتوحة بعد مراجعة الدورة الحالية.",
  },
  {
    id: "PMO-139",
    name: "أتمتة المدفوعات",
    manager: "ماجد الزهراني",
    department: "المالية",
    registerStatus: "updated",
    lastReviewed: "19 يونيو 2026",
    openRisks: 1,
    closedRisks: 5,
    openBySeverity: { critical: 0, high: 0, medium: 1, low: 0 },
    linkedMitigationTasks: 3,
    unlinkedOpenRisks: 0,
    activeChallenges: 1,
    predictedChallenges: 1,
    nextAction: "إغلاق خطر اختبار التكامل بعد اعتماد المالية.",
  },
  {
    id: "PMO-146",
    name: "أرشفة السجلات",
    manager: "هند المطيري",
    department: "الحوكمة",
    registerStatus: "stale",
    lastReviewed: "26 مايو 2026",
    openRisks: 5,
    closedRisks: 4,
    openBySeverity: { critical: 1, high: 2, medium: 2, low: 0 },
    linkedMitigationTasks: 3,
    unlinkedOpenRisks: 2,
    activeChallenges: 2,
    predictedChallenges: 1,
    nextAction: "مراجعة المخاطر الحرجة وتعيين مالك لكل إجراء.",
  },
  {
    id: "PMO-153",
    name: "لوحات ذكاء الأعمال",
    manager: "تركي السبيعي",
    department: "مكتب المشاريع",
    registerStatus: "updated",
    lastReviewed: "22 يونيو 2026",
    openRisks: 2,
    closedRisks: 7,
    openBySeverity: { critical: 0, high: 1, medium: 1, low: 0 },
    linkedMitigationTasks: 5,
    unlinkedOpenRisks: 0,
    activeChallenges: 1,
    predictedChallenges: 1,
    nextAction: "اعتماد خطة خفض مخاطر جودة المؤشرات.",
  },
];

const statusMeta: Record<
  RegisterStatus,
  { label: string; tone: string; compliant: boolean; summary: string }
> = {
  updated: {
    label: "محدث",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800",
    compliant: true,
    summary: "سجل موثق ومراجع",
  },
  stale: {
    label: "متأخر",
    tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800",
    compliant: false,
    summary: "يحتاج مراجعة",
  },
  missing: {
    label: "لا يوجد سجل",
    tone: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:ring-rose-800",
    compliant: false,
    summary: "غير موثق",
  },
  "reviewed-empty": {
    label: "تمت المراجعة",
    tone: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:ring-sky-800",
    compliant: true,
    summary: "لا توجد مخاطر حالية",
  },
};

const severityMeta: Record<Severity, { label: string; color: string; bar: string }> = {
  critical: { label: "حرجة", color: "text-rose-600", bar: "bg-rose-500" },
  high: { label: "مرتفعة", color: "text-orange-600", bar: "bg-orange-500" },
  medium: { label: "متوسطة", color: "text-amber-600", bar: "bg-amber-400" },
  low: { label: "منخفضة", color: "text-sky-600", bar: "bg-sky-500" },
};

const viewFilters: Array<{ value: ViewFilter; label: string; icon: typeof Gauge }> = [
  { value: "all", label: "كل المشاريع", icon: Users },
  { value: "attention", label: "تحتاج متابعة", icon: CircleAlert },
  { value: "open-risks", label: "مخاطر مفتوحة", icon: ShieldAlert },
  { value: "unlinked", label: "بدون مهام", icon: Link2 },
];

const numberFormatter = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}٪`;
}

function percent(numerator: number, denominator: number) {
  if (denominator === 0) return 0;
  return (numerator / denominator) * 100;
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function RiskIndicatorsDashboard() {
  const [view, setView] = useState<ViewFilter>("all");

  const summary = useMemo(() => {
    const totalProjects = projects.length;
    const compliantProjects = projects.filter((project) => statusMeta[project.registerStatus].compliant).length;
    const openRisks = projects.reduce((total, project) => total + project.openRisks, 0);
    const closedRisks = projects.reduce((total, project) => total + project.closedRisks, 0);
    const totalRisks = openRisks + closedRisks;
    const unlinkedOpenRisks = projects.reduce((total, project) => total + project.unlinkedOpenRisks, 0);
    const activeChallenges = projects.reduce((total, project) => total + project.activeChallenges, 0);
    const predictedChallenges = projects.reduce((total, project) => total + project.predictedChallenges, 0);
    const severityTotals = projects.reduce(
      (totals, project) => {
        (Object.keys(project.openBySeverity) as Severity[]).forEach((severity) => {
          totals[severity] += project.openBySeverity[severity];
        });
        return totals;
      },
      { critical: 0, high: 0, medium: 0, low: 0 } satisfies Record<Severity, number>,
    );

    const requiredProjects = Math.ceil(totalProjects * (TARGET_REGISTER_COVERAGE / 100));
    const projectsNeeded = Math.max(requiredProjects - compliantProjects, 0);

    return {
      totalProjects,
      compliantProjects,
      registerCoverage: percent(compliantProjects, totalProjects),
      openRisks,
      closedRisks,
      totalRisks,
      openRiskRate: percent(openRisks, totalRisks),
      unlinkedOpenRisks,
      activeChallenges,
      predictedChallenges,
      predictionRate: percent(predictedChallenges, activeChallenges),
      severityTotals,
      projectsNeeded,
    };
  }, []);

  const visibleProjects = useMemo(() => {
    return projects.filter((project) => {
      if (view === "attention") {
        return !statusMeta[project.registerStatus].compliant || project.openBySeverity.critical > 0;
      }
      if (view === "open-risks") return project.openRisks > 0;
      if (view === "unlinked") return project.unlinkedOpenRisks > 0;
      return true;
    });
  }, [view]);

  const actionQueue = useMemo(() => {
    return [...projects]
      .filter(
        (project) =>
          !statusMeta[project.registerStatus].compliant ||
          project.unlinkedOpenRisks > 0 ||
          project.openBySeverity.critical > 0,
      )
      .sort((a, b) => {
        const criticalDelta = b.openBySeverity.critical - a.openBySeverity.critical;
        if (criticalDelta !== 0) return criticalDelta;
        return b.unlinkedOpenRisks - a.unlinkedOpenRisks;
      })
      .slice(0, 4);
  }, []);

  const totalSeverityOpen = Object.values(summary.severityTotals).reduce((total, value) => total + value, 0);
  const registerFormula = `${formatNumber(summary.compliantProjects)} ÷ ${formatNumber(summary.totalProjects)} × 100`;
  const openRiskFormula = `${formatNumber(summary.openRisks)} ÷ ${formatNumber(summary.totalRisks)} × 100`;

  return (
    <section className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-8">
      <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-extrabold text-primary">
            <Gauge className="h-4 w-4" />
            لوحة المخاطر والتحديات
          </div>
          <h1 className="mt-4 text-3xl font-black leading-tight md:text-5xl">مؤشرات سجل المخاطر</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-600 md:text-base dark:text-zinc-300">
            فصل واضح بين التزام المشاريع بتحديث السجل وبين نسبة المخاطر المفتوحة المتبقية، مع إبراز الربط الناقص بين المخاطر والمهام.
          </p>
        </div>

        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[520px]">
          <HeaderStat icon={Clock3} label="دورة القياس" value="يونيو 2026" />
          <HeaderStat icon={Target} label="مستهدف السجل" value={`${TARGET_REGISTER_COVERAGE}٪`} />
          <HeaderStat icon={Flag} label="مشاريع مطلوبة" value={formatNumber(summary.projectsNeeded)} />
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="font-black">مصدر البيانات الحالي: نموذج تجريبي</div>
              <p className="mt-1 text-sm font-semibold leading-6">
                قاعدة MyToolkit المتصلة لا تحتوي جداول مشاريع أو مهام أو مخاطر حتى الآن، لذلك هذه الصفحة تعرض نموذج القياس
                المقترح إلى أن يتم ربطها بمصدر بيانات منصة المشاريع.
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit rounded-md bg-white/70 px-3 py-1.5 text-xs font-black text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
            Demo data
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <IndicatorCard
          title="التزام سجل المخاطر"
          value={summary.registerCoverage}
          label={`${formatNumber(summary.compliantProjects)} من ${formatNumber(summary.totalProjects)} مشاريع`}
          formula={registerFormula}
          target={`المستهدف ${TARGET_REGISTER_COVERAGE}٪`}
          tone="emerald"
          icon={ClipboardCheck}
          positive
        />
        <IndicatorCard
          title="المخاطر المفتوحة المتبقية"
          value={summary.openRiskRate}
          label={`${formatNumber(summary.openRisks)} مفتوحة من ${formatNumber(summary.totalRisks)} خطر`}
          formula={openRiskFormula}
          target={`تنبيه عند ${OPEN_RISK_WARNING_LINE}٪`}
          tone="orange"
          icon={TrendingDown}
        />
        <CompactMetric
          icon={TriangleAlert}
          label="مخاطر حرجة مفتوحة"
          value={formatNumber(summary.severityTotals.critical)}
          detail="تظهر أولًا في قائمة المتابعة"
          tone="rose"
        />
        <CompactMetric
          icon={Link2}
          label="مخاطر بلا مهمة"
          value={formatNumber(summary.unlinkedOpenRisks)}
          detail="تحتاج ربط إجراء علاجي"
          tone="sky"
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-black">توزيع المخاطر المفتوحة</h2>
              <p className="mt-1 text-sm font-medium text-zinc-500">يشمل كل المخاطر المفتوحة بغض النظر عن الحدة.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-extrabold">
              <Activity className="h-4 w-4 text-primary" />
              {formatNumber(totalSeverityOpen)} خطر مفتوح
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {(Object.keys(severityMeta) as Severity[]).map((severity) => {
              const count = summary.severityTotals[severity];
              const width = clampPercent(percent(count, totalSeverityOpen));
              const meta = severityMeta[severity];

              return (
                <div key={severity}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
                    <span className={meta.color}>{meta.label}</span>
                    <span>{formatNumber(count)}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-md bg-muted">
                    <div className={`h-full rounded-md ${meta.bar}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black">أولوية المتابعة</h2>
              <p className="mt-1 text-sm font-medium text-zinc-500">المشاريع التي تؤثر مباشرة على المؤشرين.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs font-black">
                <Activity className="h-4 w-4 text-primary" />
                {formatPercent(summary.predictionRate)} · {formatNumber(summary.predictedChallenges)} من{" "}
                {formatNumber(summary.activeChallenges)} تحديات متوقعة
              </span>
              <ListChecks className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="mt-4 divide-y divide-border">
            {actionQueue.map((project) => (
              <div key={project.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-black">{project.name}</div>
                    <div className="mt-1 text-xs font-bold text-zinc-500">
                      {project.manager} · {project.id}
                    </div>
                  </div>
                  <StatusBadge status={project.registerStatus} />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{project.nextAction}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-black">مشاريع الشركة</h2>
            <p className="mt-1 text-sm font-medium text-zinc-500">
              السجل، المخاطر، المهام، والتحديات في سطر واحد لكل مشروع.
            </p>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="تصفية مشاريع المخاطر">
            {viewFilters.map((filter) => {
              const Icon = filter.icon;
              const active = view === filter.value;

              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setView(filter.value)}
                  aria-pressed={active}
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-extrabold transition ${
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-zinc-700 hover:bg-border dark:text-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-right text-xs font-black text-zinc-500">
                <th className="px-4 py-3">المشروع</th>
                <th className="px-4 py-3">حالة السجل</th>
                <th className="px-4 py-3">آخر تحديث</th>
                <th className="px-4 py-3">مفتوحة</th>
                <th className="px-4 py-3">مغلقة</th>
                <th className="px-4 py-3">حرجة/مرتفعة</th>
                <th className="px-4 py-3">مهام مرتبطة</th>
                <th className="px-4 py-3">تحديات متوقعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleProjects.map((project) => {
                const severeOpen = project.openBySeverity.critical + project.openBySeverity.high;
                const challengeLabel =
                  project.activeChallenges === 0
                    ? "لا يوجد"
                    : `${formatNumber(project.predictedChallenges)} من ${formatNumber(project.activeChallenges)}`;

                return (
                  <tr key={project.id} className="align-top transition hover:bg-muted/45">
                    <td className="px-4 py-4">
                      <div className="font-black">{project.name}</div>
                      <div className="mt-1 text-xs font-bold text-zinc-500">
                        {project.department} · {project.manager}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={project.registerStatus} />
                      <div className="mt-2 text-xs font-semibold text-zinc-500">
                        {statusMeta[project.registerStatus].summary}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold">{project.lastReviewed}</td>
                    <td className="px-4 py-4 font-black">{formatNumber(project.openRisks)}</td>
                    <td className="px-4 py-4 font-black">{formatNumber(project.closedRisks)}</td>
                    <td className="px-4 py-4">
                      <span className={severeOpen > 0 ? "font-black text-rose-600" : "font-black text-emerald-600"}>
                        {formatNumber(severeOpen)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-black">{formatNumber(project.linkedMitigationTasks)}</div>
                      {project.unlinkedOpenRisks > 0 && (
                        <div className="mt-1 text-xs font-bold text-rose-600">
                          {formatNumber(project.unlinkedOpenRisks)} بلا مهمة
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-black">{challengeLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function HeaderStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-xs font-bold text-zinc-500">{label}</span>
        <span className="block text-base font-black">{value}</span>
      </span>
    </div>
  );
}

function IndicatorCard({
  title,
  value,
  label,
  formula,
  target,
  tone,
  icon: Icon,
  positive = false,
}: {
  title: string;
  value: number;
  label: string;
  formula: string;
  target: string;
  tone: "emerald" | "orange";
  icon: typeof Gauge;
  positive?: boolean;
}) {
  const ringColor = tone === "emerald" ? "#059669" : "#ea580c";
  const angle = clampPercent(value) * 3.6;
  const isHealthy = positive ? value >= TARGET_REGISTER_COVERAGE : value < OPEN_RISK_WARNING_LINE;

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-zinc-500">{title}</div>
          <div className="mt-2 text-3xl font-black">{formatPercent(value)}</div>
          <div className="mt-1 text-sm font-bold text-zinc-500">{label}</div>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div
          className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${ringColor} 0deg ${angle}deg, var(--muted) ${angle}deg 360deg)` }}
          aria-label={`${title}: ${formatPercent(value)}`}
        >
          <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-card text-sm font-black">
            {formatPercent(value)}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="rounded-md bg-muted px-3 py-2 text-sm font-extrabold">{formula}</div>
          <div
            className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-black ${
              isHealthy
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
            }`}
          >
            {target}
          </div>
        </div>
      </div>
    </article>
  );
}

function CompactMetric({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  detail: string;
  tone: "rose" | "sky";
}) {
  const toneClass =
    tone === "rose"
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
      : "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200";

  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-zinc-500">{label}</div>
          <div className="mt-3 text-4xl font-black">{value}</div>
        </div>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-zinc-500">{detail}</p>
    </article>
  );
}

function StatusBadge({ status }: { status: RegisterStatus }) {
  const meta = statusMeta[status];

  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ring-1 ${meta.tone}`}>
      {meta.label}
    </span>
  );
}
