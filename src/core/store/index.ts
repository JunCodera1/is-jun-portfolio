import fs from "node:fs/promises";
import path from "node:path";

/**
 * Persistence for owner-side state only (audit log, task history, proposals). The public site never needs it.
 * A small interface, so SQLite or Postgres can replace the file implementation later without touching callers.
 */
export interface Store {
  append(stream: string, entry: object): Promise<void>;
  tail(stream: string, limit: number): Promise<unknown[]>;
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  keys(prefix: string): Promise<string[]>;
  delete(key: string): Promise<void>;
  /** Delete a whole stream or every key with a prefix. Returns how many records were removed. */
  purge(what: { stream?: string; prefix?: string }): Promise<number>;
  dump(): Promise<Record<string, unknown>>;
}

const NAME = /^[a-z0-9][a-z0-9._-]{0,80}$/;
const check = (n: string) => { if (!NAME.test(n) || n.includes("..")) throw new Error("invalid store name"); return n; };

export function createMemoryStore(): Store {
  const streams = new Map<string, object[]>(), docs = new Map<string, unknown>();
  return {
    async append(s, e) { check(s); streams.set(s, [...(streams.get(s) ?? []), JSON.parse(JSON.stringify(e))]); },
    async tail(s, n) { return (streams.get(check(s)) ?? []).slice(-n); },
    async get<T>(k: string) { return docs.get(check(k)) as T | undefined; },
    async set(k, v) { docs.set(check(k), JSON.parse(JSON.stringify(v))); },
    async keys(p) { return [...docs.keys()].filter((k) => k.startsWith(p)).sort(); },
    async delete(k) { docs.delete(check(k)); },
    async purge({ stream, prefix }) { let n = 0; if (stream) { n += (streams.get(check(stream)) ?? []).length; streams.delete(stream); } if (prefix) for (const k of [...docs.keys()]) if (k.startsWith(prefix)) { docs.delete(k); n++; } return n; },
    async dump() { return { streams: Object.fromEntries(streams), docs: Object.fromEntries(docs) }; },
  };
}

/** JSONL for append-only streams, one atomic JSON file per document. A corrupt line is skipped, never fatal. */
export async function createFileStore(dir: string): Promise<Store | null> {
  try {
    await fs.mkdir(path.join(dir, "docs"), { recursive: true });
    await fs.mkdir(path.join(dir, "streams"), { recursive: true });
    const probe = path.join(dir, ".write-test");
    await fs.writeFile(probe, "ok"); await fs.rm(probe);
  } catch { return null; } // read-only or missing disk (serverless): the owner console stays off
  const sfile = (s: string) => path.join(dir, "streams", `${check(s)}.jsonl`);
  const dfile = (k: string) => path.join(dir, "docs", `${check(k)}.json`);
  const readLines = async (s: string) => { try { return (await fs.readFile(sfile(s), "utf8")).split("\n").filter(Boolean); } catch { return []; } };
  const tail = async (s: string, n: number) => { const out: unknown[] = []; for (const l of (await readLines(s)).slice(-n)) { try { out.push(JSON.parse(l)); } catch { /* skip a torn line */ } } return out; };
  const get = async <T,>(k: string) => { try { return JSON.parse(await fs.readFile(dfile(k), "utf8")) as T; } catch { return undefined; } };
  const keys = async (p: string) => (await fs.readdir(path.join(dir, "docs"))).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).filter((k) => k.startsWith(p)).sort();
  const del = async (k: string) => { await fs.rm(dfile(k), { force: true }); };
  return {
    async append(s, e) {
      const fh = await fs.open(sfile(s), "a+", 0o600);
      try {
        const { size } = await fh.stat();
        if (size > 0) { const last = Buffer.alloc(1); await fh.read(last, 0, 1, size - 1); if (last[0] !== 0x0a) await fh.write("\n"); } // a crash mid-write must not swallow the next record
        await fh.write(`${JSON.stringify(e)}\n`);
      } finally { await fh.close(); }
    },
    tail, get, keys, delete: del,
    async set(k, v) { const f = dfile(k), tmp = `${f}.${process.pid}.tmp`; await fs.writeFile(tmp, JSON.stringify(v), { mode: 0o600 }); await fs.rename(tmp, f); },
    async purge({ stream, prefix }) { let n = 0; if (stream) { n += (await readLines(stream)).length; await fs.rm(sfile(stream), { force: true }); } if (prefix) for (const k of await keys(prefix)) { await del(k); n++; } return n; },
    async dump() {
      const streams: Record<string, unknown[]> = {}, docs: Record<string, unknown> = {};
      for (const f of await fs.readdir(path.join(dir, "streams"))) if (f.endsWith(".jsonl")) streams[f.slice(0, -6)] = await tail(f.slice(0, -6), 100000);
      for (const k of await keys("")) docs[k] = await get(k);
      return { streams, docs };
    },
  };
}
