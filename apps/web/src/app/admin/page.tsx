import { AdminPanel } from "@/components/admin-panel";
import { AppHeader } from "@/components/app-header";
import { getCategories, getTools } from "@/lib/data";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";

export default async function AdminPage() {
  const [{ isAdmin, user }, tools, categories] = await Promise.all([
    getCurrentUserAndProfile(),
    getTools(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <AdminPanel isAdmin={isAdmin} userEmail={user?.email ?? null} tools={tools} categories={categories} />
    </main>
  );
}
