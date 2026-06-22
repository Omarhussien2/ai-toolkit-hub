import { AppHeader } from "@/components/app-header";
import { headers } from "next/headers";

function buildBookmarklet(baseUrl: string) {
  const safeBaseUrl = JSON.stringify(baseUrl.replace(/\/$/, ""));
  return `javascript:(()=>{const u=encodeURIComponent(location.href);const t=encodeURIComponent(document.title);open(${safeBaseUrl}+'/capture/new?url='+u+'&title='+t,'_blank','noopener')})()`;
}

export default async function BookmarkletPage() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const forwardedProto = requestHeaders.get("x-forwarded-proto") || "https";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : "https://mytoolkit-beige.vercel.app");
  const bookmarklet = buildBookmarklet(baseUrl);

  return (
    <main className="min-h-screen">
      <AppHeader />
      <section className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-semibold text-primary">بدون إضافة متصفح</p>
          <h1 className="mt-2 text-3xl font-extrabold">Bookmarklet للحفظ السريع</h1>
          <p className="mt-3 leading-8 text-zinc-600 dark:text-zinc-300">
            اسحب الزر التالي إلى شريط المفضلة في المتصفح. عند فتح أي موقع اضغط عليه لفتح صفحة مراجعة الرابط.
          </p>
          <a
            href={bookmarklet}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground"
          >
            حفظ في MyToolkit
          </a>
          <pre className="mt-6 overflow-auto rounded-md bg-muted p-4 text-left text-xs ltr" dir="ltr">
            {bookmarklet}
          </pre>
        </div>
      </section>
    </main>
  );
}
