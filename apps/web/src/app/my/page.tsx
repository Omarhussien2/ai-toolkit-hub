import { AppHeader } from "@/components/app-header";
import { MyToolkitClient } from "@/components/my-toolkit-client";

export default function MyToolkitPage() {
  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-primary">مكتبتي</p>
          <h1 className="text-3xl font-extrabold md:text-4xl">المفضلات والمجموعات</h1>
        </div>
        <MyToolkitClient />
      </section>
    </main>
  );
}
