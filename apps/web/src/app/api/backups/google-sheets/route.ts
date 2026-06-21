import { NextResponse, type NextRequest } from "next/server";
import { google } from "googleapis";
import { getTools } from "@/lib/data";
import { getCurrentUserAndProfile } from "@/lib/supabase/server";
import type { Tool } from "@/lib/types";

export const runtime = "nodejs";

const headers = [
  "name",
  "name_en",
  "description",
  "type",
  "category",
  "url",
  "domain",
  "pricing",
  "tags",
  "use_cases",
  "libraries",
  "github_full_name",
  "github_stars",
  "github_language",
  "github_license",
  "image_url",
  "notes",
  "created_at",
] satisfies (keyof Tool)[];

function getBackupValue(tool: Tool, header: (typeof headers)[number]) {
  const value = tool[header];
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}

function getGoogleEnv() {
  return {
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: process.env.GOOGLE_SHEETS_RANGE || "Tools!A1",
  };
}

async function runBackup() {
  const env = getGoogleEnv();
  if (!env.email || !env.privateKey || !env.spreadsheetId) {
    throw new Error("Google Sheets env variables are not configured.");
  }

  const auth = new google.auth.JWT({
    email: env.email,
    key: env.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  const tools = await getTools();
  const values = [
    headers,
    ...tools.map((tool) =>
      headers.map((header) => {
        return getBackupValue(tool, header);
      }),
    ),
  ];

  const sheetName = env.range.split("!")[0] || "Tools";
  await sheets.spreadsheets.values.clear({
    spreadsheetId: env.spreadsheetId,
    range: sheetName,
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: env.spreadsheetId,
    range: env.range,
    valueInputOption: "RAW",
    requestBody: { values },
  });

  return tools.length;
}

export async function POST() {
  const { supabase, user, isAdmin } = await getCurrentUserAndProfile();
  if (!supabase) return NextResponse.json({ error: "Supabase env is not configured." }, { status: 503 });
  if (!user || !isAdmin) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const started = new Date().toISOString();
  try {
    const count = await runBackup();
    await supabase.from("backup_runs").insert({
      status: "success",
      rows_synced: count,
      started_at: started,
      finished_at: new Date().toISOString(),
      message: "Manual Google Sheets backup completed",
    });
    return NextResponse.json({ message: `تم نسخ ${count} سجلًا إلى Google Sheets.` });
  } catch (error) {
    await supabase.from("backup_runs").insert({
      status: "error",
      started_at: started,
      finished_at: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Backup failed",
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backup failed." },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "1";
  if (secret && authorization !== `Bearer ${secret}` && !isVercelCron) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  try {
    const count = await runBackup();
    return NextResponse.json({ message: `Cron backup completed for ${count} rows.` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Backup failed." },
      { status: 400 },
    );
  }
}
