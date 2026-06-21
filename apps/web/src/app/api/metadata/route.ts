import { NextResponse, type NextRequest } from "next/server";
import { extractMetadata } from "@/lib/metadata";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url." }, { status: 400 });

  try {
    const metadata = await extractMetadata(url);
    return NextResponse.json({ metadata });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract metadata." },
      { status: 400 },
    );
  }
}
