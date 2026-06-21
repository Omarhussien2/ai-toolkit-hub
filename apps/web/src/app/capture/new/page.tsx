import { AppHeader } from "@/components/app-header";
import { CaptureForm } from "@/components/capture-form";
import { getCategories } from "@/lib/data";

export default async function CapturePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string; title?: string }>;
}) {
  const params = await searchParams;
  const categories = await getCategories();

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">حفظ سريع</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">راجع بيانات الرابط قبل الإدخال</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            سيتم قراءة العنوان والوصف والصورة والتصنيف المقترح، ثم يمكنك تعديل كل شيء قبل حفظه في MyToolkit.
          </p>
        </div>
        <CaptureForm initialUrl={params.url ?? ""} initialTitle={params.title ?? ""} categories={categories} />
      </section>
    </main>
  );
}
