"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, CheckCircle2, AlertTriangle, AlertCircle, Loader2, UserPlus, Key, X, Mail } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const ADMIN_EMAIL = "omarsamawah@gmail.com";

export function AuthButtons() {
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
        setIsModalOpen(false); // Close modal on successful login
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  function getAuthCallbackUrl() {
    const next = `${window.location.pathname}${window.location.search}`;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

  async function loginWithGoogle() {
    if (!supabase) {
      setMessageType("error");
      setMessage(env.error || "Ù…ÙØ§ØªÙŠØ­ Ø§ØªØµØ§Ù„ Supabase ØºÙŠØ± Ù…ØªÙˆÙØ±Ø© Ø£Ùˆ ØºÙŠØ± ØµØ§Ù„Ø­Ø©.");
      return;
    }
    try {
      setPending("google");
      setMessageType("info");
      setMessage("Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªÙˆØ¬ÙŠÙ‡ Ø¥Ù„Ù‰ Google...");
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
      setMessage("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø§Ù„Ø§ØªØµØ§Ù„ Ø¨Ù…Ø²ÙˆØ¯ Ø§Ù„Ø®Ø¯Ù…Ø©.");
    } finally {
      setPending(null);
    }
  }

  async function loginWithPassword() {
    if (!supabase) {
      setMessageType("error");
      setMessage(env.error || "Ù…ÙØ§ØªÙŠØ­ Ø§ØªØµØ§Ù„ Supabase ØºÙŠØ± Ù…ØªÙˆÙØ±Ø© Ø£Ùˆ ØºÙŠØ± ØµØ§Ù„Ø­Ø©.");
      return;
    }
    if (!emailValue || !password) {
      setMessageType("warning");
      setMessage("ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
      return;
    }

    try {
      setPending("login");
      setMessage("");
      setMessageType("");

      const { error } = await supabase.auth.signInWithPassword({
        email: emailValue,
        password: password,
      });

      if (error) {
        setMessageType("error");
        if (error.message.includes("Invalid login credentials")) {
          setMessage("Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£Ùˆ ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ØºÙŠØ± ØµØ­ÙŠØ­Ø©.");
        } else if (error.message.includes("Email not confirmed")) {
          setMessage("ÙŠØ±Ø¬Ù‰ ØªØ£ÙƒÙŠØ¯ Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ Ø£ÙˆÙ„Ø§Ù‹ØŒ Ø£Ùˆ Ù‚Ù… Ø¨Ø¥Ù„ØºØ§Ø¡ 'Confirm Email' Ù…Ù† Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Supabase.");
        } else {
          setMessage(`ÙØ´Ù„ Ø§Ù„Ø¯Ø®ÙˆÙ„: ${error.message}`);
        }
      } else {
        setMessageType("success");
        setMessage("ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­!");
        setTimeout(() => setIsModalOpen(false), 1000);
      }
    } catch (err) {
      console.error("Login caught exception:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessageType("error");
      setMessage(`Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹: ${errMsg}`);
    } finally {
      setPending(null);
    }
  }

  async function signUpWithPassword() {
    if (!supabase) {
      setMessageType("error");
      setMessage(env.error || "Ù…ÙØ§ØªÙŠØ­ Ø§ØªØµØ§Ù„ Supabase ØºÙŠØ± Ù…ØªÙˆÙØ±Ø©.");
      return;
    }
    if (!emailValue || !password) {
      setMessageType("warning");
      setMessage("ÙŠØ±Ø¬Ù‰ ÙƒØªØ§Ø¨Ø© Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±.");
      return;
    }

    try {
      setPending("signup");
      setMessage("");
      setMessageType("");

      const { data, error } = await supabase.auth.signUp({
        email: emailValue,
        password: password,
      });

      if (error) {
        setMessageType("error");
        if (error.message.includes("User already registered")) {
          setMessage("Ù‡Ø°Ø§ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù…Ø³Ø¬Ù„ Ù…Ø³Ø¨Ù‚Ø§Ù‹ØŒ ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„.");
        } else if (error.message.includes("Password should be at least")) {
          setMessage("ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ± ÙŠØ¬Ø¨ Ø£Ù† ØªÙƒÙˆÙ† 6 Ø£Ø­Ø±Ù Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.");
        } else {
          setMessage(`ÙØ´Ù„ Ø§Ù„ØªØ³Ø¬ÙŠÙ„: ${error.message}`);
        }
      } else {
        if (data.session) {
          setMessageType("success");
          setMessage("ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨ ÙˆØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø¨Ù†Ø¬Ø§Ø­!");
          setTimeout(() => setIsModalOpen(false), 1000);
        } else {
          setMessageType("success");
          setMessage("ØªÙ… Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø³Ø§Ø¨! ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† Ø¨Ø±ÙŠØ¯Ùƒ Ù„ØªØ£ÙƒÙŠØ¯Ù‡ (Ø¥Ø°Ø§ ÙƒØ§Ù† ØªÙØ¹ÙŠÙ„ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù…Ø·Ù„ÙˆØ¨Ø§Ù‹ ÙÙŠ Supabase).");
        }
      }
    } catch (err) {
      console.error("Signup caught exception:", err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessageType("error");
      setMessage(`Ø®Ø·Ø£ ØºÙŠØ± Ù…ØªÙˆÙ‚Ø¹: ${errMsg}`);
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
      case "success": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
      case "error": return "bg-rose-500/15 text-rose-600 border-rose-500/20 dark:text-rose-400";
      case "warning": return "bg-amber-500/15 text-amber-600 border-amber-500/20 dark:text-amber-400";
      case "info": return "bg-blue-500/15 text-blue-600 border-blue-500/20 dark:text-blue-400";
      default: return "text-zinc-500 border-transparent hidden";
    }
  }

  function getMessageIcon() {
    switch (messageType) {
      case "success": return <CheckCircle2 className="h-4 w-4 shrink-0" />;
      case "error": return <AlertCircle className="h-4 w-4 shrink-0" />;
      case "warning": return <AlertTriangle className="h-4 w-4 shrink-0" />;
      case "info": return <Loader2 className="h-4 w-4 shrink-0 animate-spin" />;
      default: return null;
    }
  }

  if (userEmail) {
    return (
      <div className="flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 px-2 py-1.5 rounded-full shadow-sm">
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-32 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300 md:block" dir="ltr">
          {userEmail}
        </span>
        <button
          type="button"
          onClick={logout}
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
          title="ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬"
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
        className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow transition-all active:scale-95"
      >
        <LogIn className="h-4 w-4" />
        Ø¯Ø®ÙˆÙ„
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border/50 bg-card p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 sm:top-5 sm:left-5 p-1.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center mb-8 text-center mt-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Ù…Ø±Ø­Ø¨Ø§Ù‹ Ø¨Ùƒ Ù…Ø¬Ø¯Ø¯Ø§Ù‹</h2>
              <p className="text-sm text-muted-foreground mt-1">Ø³Ø¬Ù„ Ø¯Ø®ÙˆÙ„Ùƒ Ù„Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø£Ø¯ÙˆØ§ØªÙƒ</p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => { setEmail(e.target.value); setMessage(""); }}
                    placeholder="Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ"
                    dir="ltr"
                    className="flex h-11 w-full rounded-xl border border-input bg-background pr-10 pl-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent placeholder:text-muted-foreground/70"
                    disabled={pending !== null}
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setMessage(""); }}
                    placeholder="ÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±"
                    dir="ltr"
                    className="flex h-11 w-full rounded-xl border border-input bg-background pr-10 pl-3 py-2 text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent placeholder:text-muted-foreground/70"
                    disabled={pending !== null}
                    onKeyDown={(e) => e.key === 'Enter' && loginWithPassword()}
                  />
                </div>
              </div>

              {message && (
                <div className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium leading-relaxed animate-in fade-in slide-in-from-top-2 ${getMessageClass()}`}>
                  <div className="mt-0.5">{getMessageIcon()}</div>
                  <div className="flex-1">{message}</div>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={loginWithPassword}
                  disabled={pending !== null}
                  className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-70"
                >
                  {pending === "login" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  <span>ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„</span>
                </button>
                <button
                  type="button"
                  onClick={signUpWithPassword}
                  disabled={pending !== null}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-sm transition-all hover:bg-secondary/80 active:scale-95 disabled:opacity-70"
                  title="Ø­Ø³Ø§Ø¨ Ø¬Ø¯ÙŠØ¯"
                >
                  {pending === "signup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground font-medium">Ø£Ùˆ Ø¹Ø¨Ø±</span>
                </div>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                disabled={pending !== null}
                className="group relative flex w-full items-center justify-center gap-3 h-11 rounded-xl border border-input bg-background px-4 text-sm font-semibold shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 disabled:opacity-70"
              >
                {pending === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                <span dir="ltr">Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
