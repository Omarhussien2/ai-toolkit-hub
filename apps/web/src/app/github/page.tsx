import { AppHeader } from "@/components/app-header";
import { ToolkitDashboard } from "@/components/toolkit-dashboard";
import { getCategories, getTools } from "@/lib/data";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GitHubPage() {
  const [{ isAdmin }, tools, categories] = await Promise.all([
    getCurrentUserAndProfile(),
    getTools("github"),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <ToolkitDashboard
        tools={tools}
        categories={categories}
        initialIsAdmin={isAdmin}
        defaultType="github"
        title="GitHub Library"
        subtitle="مستودعات GitHub مفهرسة مع الاستخدامات، المكتبات، اللغة، والنجوم حتى تقدر ترجع لها وتضيف عليها بسرعة."
      />
    </main>
  );
}
