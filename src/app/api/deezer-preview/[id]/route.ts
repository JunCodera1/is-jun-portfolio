/**
 * Deezer's 30-second preview URLs are signed and expire quickly, so they can't be cached in a page.
 * This asks Deezer for a fresh one at play time and redirects to it. Only numeric ids, only Deezer's own CDN host.
 */
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,12}$/.test(id)) return new Response("Bad id", { status: 400 });
  try {
    const res = await fetch(`https://api.deezer.com/track/${id}`, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return new Response("Unavailable", { status: 502 });
    const data = (await res.json()) as { preview?: unknown };
    const u = typeof data.preview === "string" ? new URL(data.preview) : null;
    if (!u || u.protocol !== "https:" || !u.hostname.endsWith(".dzcdn.net")) return new Response("No preview", { status: 404 });
    return new Response(null, { status: 302, headers: { Location: u.toString(), "Cache-Control": "private, max-age=60" } });
  } catch {
    return new Response("Unavailable", { status: 502 });
  }
}
