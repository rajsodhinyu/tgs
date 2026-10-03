import type { NextRequest } from "next/server";

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export function logError(message: string, err: unknown, extra: Record<string, unknown> = {}) {
  console.error(`[tgos] ${message}`, {
    ...extra,
    error: err instanceof Error ? err.message : String(err),
  });
}
