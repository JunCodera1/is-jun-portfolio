import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Owner authentication with Node built-ins only: scrypt password hashes and HMAC-signed, expiring, httpOnly session cookies.
 * One owner, no accounts, no database. The password itself is never stored or logged; only its hash lives in the server environment.
 */
const N = 16384, R = 8, P = 1, KEYLEN = 32, MAXMEM = 64 * 1024 * 1024;
const kdf = (pw: string, salt: Buffer, n = N, r = R, p = P) => new Promise<Buffer>((res, rej) => scrypt(pw, salt, KEYLEN, { N: n, r, p, maxmem: MAXMEM }, (e, k) => (e ? rej(e) : res(k))));

export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64url")}$${(await kdf(pw, salt)).toString("base64url")}`;
}
export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const [alg, n, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt" || !salt || !hash) return false;
  try {
    const want = Buffer.from(hash, "base64url");
    const got = await kdf(pw, Buffer.from(salt, "base64url"), Number(n), Number(r), Number(p));
    return got.length === want.length && timingSafeEqual(got, want);
  } catch { return false; }
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const mac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest();

export function signSession(secret: string, ttlMs: number, now = Date.now()): string {
  const payload = b64(JSON.stringify({ exp: now + ttlMs, n: randomBytes(8).toString("hex") }));
  return `v1.${payload}.${b64(mac(secret, `v1.${payload}`))}`;
}
export function verifySession(token: string | undefined | null, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [v, payload, sig] = token.split(".");
  if (v !== "v1" || !payload || !sig) return false;
  const want = mac(secret, `v1.${payload}`), got = Buffer.from(sig, "base64url");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return false;
  try { return (JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp: number }).exp > now; } catch { return false; }
}

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const cookieName = (secure: boolean) => (secure ? "__Host-owner" : "owner");
export const sessionCookie = (token: string, secure: boolean, maxAgeS = SESSION_TTL_MS / 1000) => `${cookieName(secure)}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAgeS}${secure ? "; Secure" : ""}`;
export const clearCookie = (secure: boolean) => sessionCookie("", secure, 0);
export function readCookie(req: Request, name: string): string | undefined {
  for (const part of (req.headers.get("cookie") ?? "").split(";")) { const [k, ...v] = part.trim().split("="); if (k === name) return v.join("="); }
  return undefined;
}
