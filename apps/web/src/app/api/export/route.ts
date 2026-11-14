import { NextResponse, type NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { getTools } from "@/lib/data";
import { csvEscape } from "@/lib/utils";
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

function getExportValue(tool: Tool, header: (typeof headers)[number]) {
  const value = tool[header];
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get("format") ?? "csv";
  const tools = await getTools();

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Tools");
    sheet.addRow(headers);
    tools.forEach((tool) => {
      sheet.addRow(headers.map((header) => getExportValue(tool, header)));
    });
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = 24;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": "attachment; filename=mytoolkit-tools.xlsx",
      },
    });
  }

  const csv = [
    headers.map(csvEscape).join(","),
    ...tools.map((tool) => headers.map((header) => csvEscape(getExportValue(tool, header))).join(",")),
  ].join("\n");

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=mytoolkit-tools.csv",
    },
  });
}
