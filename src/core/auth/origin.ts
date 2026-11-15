/** Same-origin check for state-changing requests. Browsers always send Origin on cross-site POSTs; a mismatch is refused. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl, tests) send none; cookies are SameSite=Strict, so a browser CSRF attempt always carries one
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try { return !!host && new URL(origin).host === host; } catch { return false; }
}
export function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim().slice(0, 64);
}
