import { AppHeader } from "@/components/app-header";
import { ToolkitDashboard } from "@/components/toolkit-dashboard";
import { getCategories, getTools } from "@/lib/data";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ isAdmin }, tools, categories] = await Promise.all([
    getCurrentUserAndProfile(),
    getTools(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <ToolkitDashboard
        tools={tools}
        categories={categories}
        initialIsAdmin={isAdmin}
        title="MyToolkit"
        subtitle="دليل عملي لأدوات الذكاء الاصطناعي والتقنية، مع حفظ روابط سريع ومراجعة البيانات قبل الإدخال."
      />
    </main>
  );
}
