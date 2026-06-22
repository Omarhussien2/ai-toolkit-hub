import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "mytoolkit-hub.vercel.app";
const LEGACY_HOSTS = new Set([
  "web-sigma-eight-44.vercel.app",
  "web-samawahs-projects.vercel.app",
  "web-samawahpod-2242-samawahs-projects.vercel.app",
  "mytoolkit-beige.vercel.app",
]);

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (!host || !LEGACY_HOSTS.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.protocol = "https";
  url.host = CANONICAL_HOST;

  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|apple-icon.png).*)"],
};
