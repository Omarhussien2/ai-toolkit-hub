import { AppHeader } from "@/components/app-header";
import { ToolkitDashboard } from "@/components/toolkit-dashboard";
import { getCategories, getTools } from "@/lib/data";

export default async function LearnPage() {
  const [tools, categories] = await Promise.all([getTools("learn"), getCategories()]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <ToolkitDashboard
        tools={tools}
        categories={categories}
        defaultType="learn"
        title="التعلم والتطبيق"
        subtitle="مصادر ودروس وروابط مرجعية تساعدك تستخدم الأدوات بذكاء."
      />
    </main>
  );
}
