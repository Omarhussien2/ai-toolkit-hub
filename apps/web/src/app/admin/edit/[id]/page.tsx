import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { EditToolForm } from "@/components/edit-tool-form";
import { getCategories, getToolById } from "@/lib/data";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { isAdmin } = await getCurrentUserAndProfile();

  if (!isAdmin) {
    redirect("/");
  }

  const [tool, categories] = await Promise.all([
    getToolById(id),
    getCategories(),
  ]);

  if (!tool) {
    return (
      <main className="min-h-screen">
        <AppHeader />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-3xl font-black">عذرًا، لم يتم العثور على الأداة المطلوبة</h1>
          <p className="mt-4 text-zinc-500">قد تكون الأداة قد حُذفت بالفعل أو أن الرابط غير صحيح.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <AppHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black">تعديل بيانات الأداة: {tool.name}</h1>
          <p className="mt-2 text-zinc-500 font-bold text-zinc-500">يمكنك تعديل أي بيانات هنا أو حذف الكارت نهائيًا من زر الحذف بالأسفل.</p>
        </div>
        <EditToolForm tool={tool} categories={categories} />
      </div>
    </main>
  );
}
