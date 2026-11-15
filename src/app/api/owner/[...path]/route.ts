import { getOwnerContext } from "@/core/owner/context";
import { handleOwner } from "@/core/owner/handlers";

export const dynamic = "force-dynamic";

async function dispatch(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const c = await getOwnerContext();
  if (!c) return new Response("Not found", { status: 404 }); // not configured: the console does not exist
  try { return await handleOwner(req, (await params).path, c); } catch { return Response.json({ error: "internal_error" }, { status: 500, headers: { "Cache-Control": "no-store" } }); }
}
export const GET = dispatch;
export const POST = dispatch;
