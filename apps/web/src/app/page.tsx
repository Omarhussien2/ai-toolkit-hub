import { AppHeader } from "@/components/app-header";
import { ToolkitDashboard } from "@/components/toolkit-dashboard";
import { getCategories, getTools } from "@/lib/data";

export default async function HomePage() {
  const [tools, categories] = await Promise.all([getTools(), getCategories()]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <ToolkitDashboard
        tools={tools}
        categories={categories}
        title="MyToolkit"
        subtitle="دليل عملي لأدوات الذكاء الاصطناعي والتقنية، مع حفظ روابط سريع ومراجعة البيانات قبل الإدخال."
      />
    </main>
  );
}
