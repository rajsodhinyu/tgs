import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

import { bgStyle, type BgStyle } from "@/app/blog/bgStyle";

const CONFIG_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "blog",
  "bgStyle.json",
);

export async function GET() {
  return NextResponse.json(bgStyle);
}

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Saving background color is only available in development." },
      { status: 403 },
    );
  }

  let body: Partial<BgStyle>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const color = typeof body.color === "string" ? body.color.trim() : "";
  if (!color) {
    return NextResponse.json(
      { error: "Missing `color`." },
      { status: 400 },
    );
  }

  const next: BgStyle = { color };

  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n", "utf8");
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to write config: ${err?.message ?? err}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, style: next });
}
