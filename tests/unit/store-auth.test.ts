import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { clearCookie, cookieName, hashPassword, readCookie, sessionCookie, signSession, verifyPassword, verifySession } from "@/core/auth/owner";
import { createFileStore, createMemoryStore, type Store } from "@/core/store";

const SECRET = "x".repeat(40);

describe("password hashing and sessions", () => {
  it("hashes with a random salt, verifies the right password only, and rejects malformed hashes", async () => {
    const h1 = await hashPassword("correct horse battery"), h2 = await hashPassword("correct horse battery");
    expect(h1).not.toBe(h2); expect(h1).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(await verifyPassword("correct horse battery", h1)).toBe(true);
    for (const bad of ["wrong", "", "correct horse batterY", " correct horse battery"]) expect(await verifyPassword(bad, h1)).toBe(false);
    for (const junk of ["", "scrypt", "md5$a$b", "scrypt$1$1$1$a$b", "scrypt$16384$8$1$AAAA$"]) expect(await verifyPassword("x", junk)).toBe(false);
  }, 20000);
  it("sessions verify, expire, and cannot be forged, truncated or replayed with another secret", () => {
    const t = signSession(SECRET, 1000, 5000);
    expect(verifySession(t, SECRET, 5500)).toBe(true);
    expect(verifySession(t, SECRET, 6001)).toBe(false);           // expired
    expect(verifySession(t, "y".repeat(40), 5500)).toBe(false);   // other secret
    const [v, p, s] = t.split(".");
    const forged = `${v}.${Buffer.from(JSON.stringify({ exp: 9e15, n: "x" })).toString("base64url")}.${s}`;
    for (const bad of [forged, `${v}.${p}`, `${v}.${p}.`, `v2.${p}.${s}`, "", "garbage", undefined, null]) expect(verifySession(bad as string, SECRET, 5500), String(bad)).toBe(false);
    expect(signSession(SECRET, 1000, 5000)).not.toBe(t); // random nonce
  });
  it("cookies are httpOnly, SameSite=Strict, scoped to /, and __Host- prefixed with Secure over https", () => {
    const c = sessionCookie("tok", true);
    expect(c).toContain("__Host-owner=tok"); for (const a of ["HttpOnly", "SameSite=Strict", "Path=/", "Secure"]) expect(c).toContain(a);
    expect(c).not.toContain("Domain");
    expect(sessionCookie("tok", false)).not.toContain("Secure"); expect(cookieName(false)).toBe("owner");
    expect(clearCookie(true)).toContain("Max-Age=0");
    expect(readCookie(new Request("https://a.test", { headers: { cookie: "a=1; owner=abc.def; b=2" } }), "owner")).toBe("abc.def");
  });
});

async function contract(make: () => Promise<Store>) {
  const s = await make();
  await s.append("audit", { a: 1 }); await s.append("audit", { a: 2 }); await s.append("audit", { a: 3 });
  expect(await s.tail("audit", 2)).toEqual([{ a: 2 }, { a: 3 }]);
  await s.set("task.1", { x: 1 }); await s.set("task.2", { x: 2 }); await s.set("other", { y: 1 });
  expect(await s.get("task.1")).toEqual({ x: 1 }); expect(await s.get("missing")).toBeUndefined();
  expect(await s.keys("task.")).toEqual(["task.1", "task.2"]);
  await s.set("task.1", { x: 9 }); expect(await s.get("task.1")).toEqual({ x: 9 });
  expect((await s.dump()).docs).toMatchObject({ other: { y: 1 } });
  expect(await s.purge({ prefix: "task." })).toBe(2); expect(await s.keys("task.")).toEqual([]); expect(await s.get("other")).toEqual({ y: 1 });
  expect(await s.purge({ stream: "audit" })).toBe(3); expect(await s.tail("audit", 10)).toEqual([]);
  for (const bad of ["../x", "a/b", "", "A", ".hidden", "a..b", "x".repeat(200)]) { await expect(s.set(bad, 1)).rejects.toThrow(); await expect(s.append(bad, {})).rejects.toThrow(); }
}

describe("store contract", () => {
  it("memory store", async () => { await contract(async () => createMemoryStore()); });
  it("file store: same contract, files are private, writes are atomic, a torn line is skipped", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "store-"));
    await contract(async () => (await createFileStore(dir))!);
    const s = (await createFileStore(dir))!;
    await s.append("tasks", { ok: 1 });
    await fs.appendFile(path.join(dir, "streams", "tasks.jsonl"), '{"torn":');
    await s.append("tasks", { ok: 2 });
    expect(await s.tail("tasks", 10)).toEqual([{ ok: 1 }, { ok: 2 }]);
    await s.set("k", { v: 1 });
    expect(((await fs.stat(path.join(dir, "docs", "k.json"))).mode & 0o077)).toBe(0); // owner-only
    expect((await fs.readdir(path.join(dir, "docs"))).some((f) => f.endsWith(".tmp"))).toBe(false);
    await fs.rm(dir, { recursive: true });
  });
  it("fails closed when the directory is not writable", async () => { expect(await createFileStore("/proc/definitely-not-writable/x")).toBeNull(); });
});
