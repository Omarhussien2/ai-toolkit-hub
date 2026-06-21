import Image from "next/image";
import Link from "next/link";
import { BookmarkPlus, Code2, Database, Home, Library, Sparkles } from "lucide-react";
import { AuthButtons } from "@/components/auth-buttons";

const nav = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/learn", label: "التعلم", icon: Sparkles },
  { href: "/github", label: "GitHub", icon: Code2 },
  { href: "/my", label: "مكتبتي", icon: Library },
  { href: "/capture/new", label: "حفظ رابط", icon: BookmarkPlus },
  { href: "/admin", label: "الأدمن", icon: Database },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand-icon.png"
            alt="MyToolkit Logo"
            width={56}
            height={40}
            priority
            className="h-10 w-14 object-contain"
          />
          <span>
            <span className="block text-lg font-extrabold">MyToolkit</span>
            <span className="block text-xs font-medium text-zinc-500">AI tools hub</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-bold text-zinc-700 transition hover:bg-muted dark:text-zinc-200"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <AuthButtons />
      </div>
    </header>
  );
}
