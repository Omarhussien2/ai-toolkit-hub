import { AppHeader } from "@/components/app-header";
import { ToolkitDashboard } from "@/components/toolkit-dashboard";
import { getCategories, getTools } from "@/lib/data";

export default async function GitHubPage() {
  const [tools, categories] = await Promise.all([getTools("github"), getCategories()]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <ToolkitDashboard
        tools={tools}
        categories={categories}
        defaultType="github"
        title="GitHub Library"
        subtitle="مستودعات GitHub مفهرسة مع الاستخدامات، المكتبات، اللغة، والنجوم حتى تقدر ترجع لها وتضيف عليها بسرعة."
      />
    </main>
  );
}
