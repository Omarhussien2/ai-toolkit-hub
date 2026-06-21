"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { AuthButtons } from "@/components/auth-buttons";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type FavoriteRow = {
  id: string;
  tools: {
    name: string;
    description: string;
    url: string;
    category_name: string | null;
  } | null;
};

export function MyToolkitClient() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setMessage("أضف إعدادات Supabase لتفعيل المفضلات.");
        setLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setMessage("سجل الدخول لعرض مكتبتك.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("favorites")
        .select("id, tools(name,description,url,category_name)")
        .order("created_at", { ascending: false });
      if (error) setMessage(error.message);
      setFavorites((data as unknown as FavoriteRow[]) ?? []);
      setLoading(false);
    }
    void load();
  }, [supabase]);

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (message) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <p className="mb-4 font-bold">{message}</p>
        <AuthButtons />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {favorites.map((favorite) => (
        <article key={favorite.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-bold text-primary">{favorite.tools?.category_name ?? "مفضلة"}</p>
          <h2 className="mt-2 text-xl font-black">{favorite.tools?.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
            {favorite.tools?.description}
          </p>
          {favorite.tools?.url && (
            <a
              href={favorite.tools.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-black text-primary-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              فتح
            </a>
          )}
        </article>
      ))}
      {favorites.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center font-bold">
          لم تضف أي أدوات للمفضلة بعد.
        </div>
      )}
    </div>
  );
}
