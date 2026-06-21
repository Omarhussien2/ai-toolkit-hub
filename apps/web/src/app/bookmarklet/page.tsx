import { AppHeader } from "@/components/app-header";
import { CAPTURE_BOOKMARKLET } from "@/lib/constants";

export default function BookmarkletPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">بدون إضافة متصفح</p>
          <h1 className="mt-2 text-3xl font-extrabold">Bookmarklet للحفظ السريع</h1>
          <p className="mt-3 leading-8 text-zinc-600 dark:text-zinc-300">
            اسحب الزر التالي إلى شريط المفضلة في المتصفح. عند فتح أي موقع اضغط عليه لفتح صفحة مراجعة الرابط.
          </p>
          <a
            href={CAPTURE_BOOKMARKLET}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            حفظ في MyToolkit
          </a>
          <pre className="mt-6 overflow-auto rounded-md bg-muted p-4 text-left text-xs ltr" dir="ltr">
            {CAPTURE_BOOKMARKLET}
          </pre>
        </div>
      </section>
    </main>
  );
}
