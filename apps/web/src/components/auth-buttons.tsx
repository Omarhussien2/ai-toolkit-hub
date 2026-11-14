"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, CheckCircle2, AlertTriangle, AlertCircle, Loader2, UserPlus, Key, X, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { ADMIN_EMAIL } from "@/lib/constants";

const CANONICAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
const emptySubscribe = () => () => {};

export function AuthButtons() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "info" | "">("");
  const [pending, setPending] = useState<"login" | "signup" | "google" | null>(null);

  const supabase = getSupabaseBrowserClient();
  const env = getSupabasePublicEnv();
  const pathname = usePathname();
  const emailValue = email || (pathname === "/admin" ? ADMIN_EMAIL : "");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      if (session?.user) {
        setIsModalOpen(false);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  function getAuthCallbackUrl() {
    const next = `${window.location.pathname}${window.location.search}`;
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const origin = isLocalhost ? window.location.origin : (CANONICAL_APP_URL || window.location.origin);
    return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function loginWithGoogle() {
    if (!supabase) {
      setMessageType("error");
      setMessage(env.error || "مفاتيح اتصال Supabase غير متوفرة أو غير صالحة.");
      return;
    }
    try {
      setPending("google");
      setMessageType("info");
      setMessage("جاري التوجيه إلى Google...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(),
        },
      });
      if (error) {
        setMessageType("error");
        setMessage(error.message);
      }
    } catch {
      setMessageType("error");
      setMessage("حدث خطأ أثناء الاتصال بمزود الخدمة.");
    } finally {
      setPending(null);
    }
  }

  async function loginWithPassword() {
    if (!supabase) {
      setMessageType("error");
      setMessage(env.error || "مفاتيح اتصال Supabase غير متوفرة أو غير صالحة.");
      return;
    }
    if (!emailValue || !password) {
      setMessageType("warning");
      setMessage("يرجى كتابة البريد الإلكتروني وكلمة المرور.");
      return;
    }

    try {
      setPending("login");
      setMessage("");
      setMessageType("");

      const { error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password,
      });

      if (error) {
        setMessageType("error");
        if (error.message.includes("Invalid login credentials")) {
          setMessage("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
        } else if (error.message.includes("Email not confirmed")) {
          setMessage("يرجى تأكيد بريدك الإلكتروني أولًا، أو قم بإلغاء Confirm Email من إعدادات Supabase.");
        } else {
          setMessage(`فشل الدخول: ${error.message}`);
        }
      } else {
        setMessageType("success");
        setMessage("تم تسجيل الدخول بنجاح!");
        setTimeout(() => setIsModalOpen(false), 1000);
      }
    } catch (err) {
      console.error("Login caught exception:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessageType("error");
      setMessage(`خطأ غير متوقع: ${errMsg}`);
    } finally {
      setPending(null);
    }
  }

  async function signUpWithPassword() {
    if (!supabase) {
      setMessageType("error");
      setMessage(env.error || "مفاتيح اتصال Supabase غير متوفرة.");
      return;
    }
    if (!emailValue || !password) {
      setMessageType("warning");
      setMessage("يرجى كتابة البريد الإلكتروني وكلمة المرور.");
      return;
    }

    try {
      setPending("signup");
      setMessage("");
      setMessageType("");

      const { data, error } = await supabase.auth.signUp({
        email: emailValue,
        password,
      });

      if (error) {
        setMessageType("error");
        if (error.message.includes("User already registered")) {
          setMessage("هذا البريد مسجل مسبقًا، يرجى تسجيل الدخول.");
        } else if (error.message.includes("Password should be at least")) {
          setMessage("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
        } else {
          setMessage(`فشل التسجيل: ${error.message}`);
        }
      } else if (data.session) {
        setMessageType("success");
        setMessage("تم إنشاء الحساب وتسجيل الدخول بنجاح!");
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setMessageType("success");
        setMessage("تم إنشاء الحساب! يرجى التحقق من بريدك لتأكيده إذا كان تفعيل البريد مطلوبًا في Supabase.");
      }
    } catch (err) {
      console.error("Signup caught exception:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessageType("error");
      setMessage(`خطأ غير متوقع: ${errMsg}`);
    } finally {
      setPending(null);
    }
  }

  async function logout() {
    await supabase?.auth.signOut();
    setUserEmail(null);
    setMessage("");
    setMessageType("");
  }

  function getMessageClass() {
    switch (messageType) {
      case "success":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
      case "error":
        return "bg-rose-500/15 text-rose-600 border-rose-500/20 dark:text-rose-400";
      case "warning":
        return "bg-amber-500/15 text-amber-600 border-amber-500/20 dark:text-amber-400";
      case "info":
        return "bg-blue-500/15 text-blue-600 border-blue-500/20 dark:text-blue-400";
      default:
        return "text-zinc-500 border-transparent hidden";
    }
  }

  function getMessageIcon() {
    switch (messageType) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 shrink-0" />;
      case "error":
        return <AlertCircle className="h-4 w-4 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 shrink-0" />;
      case "info":
        return <Loader2 className="h-4 w-4 shrink-0 animate-spin" />;
      default:
        return null;
    }
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card/50 px-2 py-1.5 shadow-sm backdrop-blur-sm">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-32 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300 md:block" dir="ltr">
          {userEmail}
        </span>
        <button
          type="button"
          onClick={logout}
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
          title="تسجيل الخروج"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow active:scale-95"
      >
        <LogIn className="h-4 w-4" />
        دخول
      </button>

      {isModalOpen &&
        (mounted
          ? createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                <div
                  className="absolute inset-0 animate-in fade-in bg-background/80 backdrop-blur-sm duration-200"
                  onClick={() => setIsModalOpen(false)}
                />
                <div className="relative z-10 w-full max-w-sm animate-in rounded-3xl border border-border/50 bg-card p-6 shadow-2xl slide-in-from-bottom-4 zoom-in-95 duration-300 sm:p-8">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute left-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:left-5 sm:top-5"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="mb-8 mt-2 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">مرحبًا بك مجددًا</h2>
                    <p className="mt-1 text-sm text-muted-foreground">سجل دخولك للوصول إلى أدواتك</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          value={emailValue}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setMessage("");
                          }}
                          placeholder="البريد الإلكتروني"
                          dir="ltr"
                          className="flex h-11 w-full rounded-xl border border-input bg-background py-2 pr-10 pl-3 text-left text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={pending !== null}
                        />
                      </div>

                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                          <Key className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            setMessage("");
                          }}
                          placeholder="كلمة المرور"
                          dir="ltr"
                          className="flex h-11 w-full rounded-xl border border-input bg-background py-2 pr-10 pl-3 text-left text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          disabled={pending !== null}
                          onKeyDown={(event) => event.key === "Enter" && loginWithPassword()}
                        />
                      </div>
                    </div>

                    {message && (
                      <div className={`flex animate-in items-start gap-2.5 rounded-xl border p-3 text-xs font-medium leading-relaxed slide-in-from-top-2 fade-in ${getMessageClass()}`}>
                        <div className="mt-0.5">{getMessageIcon()}</div>
                        <div className="flex-1">{message}</div>
                      </div>
                    )}

                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={loginWithPassword}
                        disabled={pending !== null}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70"
                      >
                        {pending === "login" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        <span>تسجيل الدخول</span>
                      </button>
                      <button
                        type="button"
                        onClick={signUpWithPassword}
                        disabled={pending !== null}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-sm transition-all hover:bg-secondary/80 active:scale-95 disabled:opacity-70"
                        title="حساب جديد"
                      >
                        {pending === "signup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-3 font-medium text-muted-foreground">أو عبر</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={loginWithGoogle}
                      disabled={pending !== null}
                      className="group relative flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-input bg-background px-4 text-sm font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 disabled:opacity-70"
                    >
                      {pending === "google" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                      )}
                      <span dir="ltr">Continue with Google</span>
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )
          : null)}
    </>
  );
}
