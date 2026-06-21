import { AppHeader } from "@/components/app-header";
import { ToolkitDashboard } from "@/components/toolkit-dashboard";
import { getCategories, getTools } from "@/lib/data";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const [{ isAdmin }, tools, categories] = await Promise.all([
    getCurrentUserAndProfile(),
    getTools("learn"),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <ToolkitDashboard
        tools={tools}
        categories={categories}
        initialIsAdmin={isAdmin}
        defaultType="learn"
        title="التعلم والتطبيق"
        subtitle="مصادر ودروس وروابط مرجعية تساعدك تستخدم الأدوات بذكاء."
      />
    </main>
  );
}
