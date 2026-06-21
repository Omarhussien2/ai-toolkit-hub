"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function loginWithGoogle() {
    if (!supabase) {
      setMessage("أضف مفاتيح Supabase في env أولًا.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function loginWithEmail() {
    if (!supabase || !email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setMessage(error ? error.message : "تم إرسال رابط الدخول إلى بريدك.");
  }

  async function logout() {
    await supabase?.auth.signOut();
    setUserEmail(null);
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden max-w-40 truncate text-xs font-semibold text-zinc-500 md:block">
          {userEmail}
        </span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-bold"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={loginWithGoogle}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground"
      >
        <LogIn className="h-4 w-4" />
        Google
      </button>
      <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="email"
          dir="ltr"
          className="h-8 w-36 bg-transparent px-2 text-sm outline-none"
        />
        <button
          type="button"
          onClick={loginWithEmail}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted"
          title="إرسال رابط الدخول"
        >
          <Mail className="h-4 w-4" />
        </button>
      </div>
      {message && <span className="basis-full text-xs text-zinc-500">{message}</span>}
    </div>
  );
}
