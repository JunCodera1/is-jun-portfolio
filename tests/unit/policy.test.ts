import { describe, expect, it } from "vitest";
import { auditEntry, redact } from "@/core/policy/audit";
import { decide, readable, type Action, type Actor, type AgentLevel, type Resource } from "@/core/policy";

const VIS = ["public", "unlisted", "private", "restricted"] as const;
const AUTH = ["owner", "integration", "ai"] as const;
const res = (visibility: Resource["visibility"], authorship: Resource["authorship"] = "owner"): Resource => ({ visibility, authorship });
const agent = (level: AgentLevel, allow: string[] = []): Actor => ({ type: "agent", id: "t", level, allow });

describe("policy: visitors", () => {
  it("may read only public data and do nothing else", () => {
    for (const v of VIS) expect(decide({ type: "visitor" }, { kind: "read" }, res(v)).allow).toBe(v === "public");
    for (const a of [{ kind: "draft" }, { kind: "write" }, { kind: "publish" }, { kind: "delete" }, { kind: "credentials" }, { kind: "operate", name: "x", lowRisk: true }, { kind: "external", irreversible: false }] as Action[]) expect(decide({ type: "visitor" }, a, res("public")).allow).toBe(false);
    expect(decide({ type: "visitor" }, { kind: "read" }).allow).toBe(false); // no resource → no access
  });
});

describe("policy: owner", () => {
  it("is the authority, including over restricted data and AI-authored items", () => {
    for (const v of VIS) for (const au of AUTH) expect(decide({ type: "owner" }, { kind: "read" }, res(v, au)).allow).toBe(true);
    expect(decide({ type: "owner" }, { kind: "publish" }, res("private", "ai")).allow).toBe(true);
  });
});

describe("policy: agents — hard limits hold at every level", () => {
  const HARD: Action[] = [{ kind: "publish" }, { kind: "delete" }, { kind: "credentials" }, { kind: "external", irreversible: true }];
  for (const level of [1, 2, 3, 4] as AgentLevel[]) {
    it(`level ${level}: never publish, delete, touch credentials, act irreversibly, or read restricted data`, () => {
      for (const a of HARD) expect(decide(agent(level, ["anything"]), a, res("public")).allow, `${a.kind}`).toBe(false);
      for (const au of AUTH) expect(decide(agent(level), { kind: "read" }, res("restricted", au)).allow).toBe(false);
    });
  }
});

describe("policy: agents — what each level may do", () => {
  it("level 1 reads public and private data, and nothing else", () => {
    expect(decide(agent(1), { kind: "read" }, res("private")).allow).toBe(true);
    for (const a of [{ kind: "draft" }, { kind: "write" }, { kind: "operate", name: "x", lowRisk: true }] as Action[]) expect(decide(agent(1), a, res("public")).allow).toBe(false);
  });
  it("level 2 may draft, never write or operate", () => {
    expect(decide(agent(2), { kind: "draft" }, res("private", "ai")).allow).toBe(true);
    expect(decide(agent(2), { kind: "write" }, res("private")).allow).toBe(false);
    expect(decide(agent(2), { kind: "operate", name: "x", lowRisk: true }).allow).toBe(false);
  });
  it("level 3 may write or operate only with the owner's approval", () => {
    for (const a of [{ kind: "write" }, { kind: "operate", name: "x", lowRisk: true }, { kind: "operate", name: "y", lowRisk: false }, { kind: "external", irreversible: false }] as Action[]) {
      const d = decide(agent(3), a, res("private"));
      expect(d).toMatchObject({ allow: true, requires: "approval" });
    }
  });
  it("level 4 runs only allow-listed LOW-RISK operations without approval; everything else still needs it", () => {
    const a4 = agent(4, ["health.refresh"]);
    expect(decide(a4, { kind: "operate", name: "health.refresh", lowRisk: true })).toMatchObject({ allow: true, requires: "none" });
    expect(decide(a4, { kind: "operate", name: "cache.clear", lowRisk: true }).requires).toBe("approval");        // not on the list
    expect(decide(a4, { kind: "operate", name: "health.refresh", lowRisk: false }).requires).toBe("approval");     // listed but not low-risk
    expect(decide(a4, { kind: "write" }, res("private")).requires).toBe("approval");
  });
  it("is deterministic and total: every actor × action × resource yields a decision with a reason", () => {
    const actors: Actor[] = [{ type: "visitor" }, { type: "owner" }, agent(1), agent(2), agent(3), agent(4)];
    const actions: Action[] = [{ kind: "read" }, { kind: "draft" }, { kind: "write" }, { kind: "publish" }, { kind: "delete" }, { kind: "credentials" }, { kind: "operate", name: "n", lowRisk: true }, { kind: "external", irreversible: false }, { kind: "external", irreversible: true }];
    for (const ac of actors) for (const a of actions) for (const v of VIS) { const d = decide(ac, a, res(v)); expect(typeof d.allow).toBe("boolean"); expect(d.reason.length).toBeGreaterThan(2); expect(decide(ac, a, res(v))).toEqual(d); }
  });
  it("readable() filters collections by the same rule", () => {
    const items = VIS.map((v) => ({ id: v, ...res(v) }));
    expect(readable({ type: "visitor" }, items).map((i) => i.id)).toEqual(["public"]);
    expect(readable(agent(2), items).map((i) => i.id)).toEqual(["public", "unlisted", "private"]);
    expect(readable({ type: "owner" }, items)).toHaveLength(4);
  });
});

describe("audit and redaction", () => {
  it("redacts secret-looking keys, bearer tokens and well-known token shapes, recursively", () => {
    const r = redact({ user: "a", password: "hunter2", nested: { apiKey: "abc", note: "Authorization: Bearer abcdefghijklmnop", ok: 1 }, list: ["ghp_abcdefghijklmnopqrstuvwx", "fine"] }) as Record<string, unknown>;
    expect(JSON.stringify(r)).not.toMatch(/hunter2|abcdefghijklmnop|ghp_abc|"abc"/);
    expect(r.user).toBe("a");
    expect((r.nested as Record<string, unknown>).ok).toBe(1);
  });
  it("audit entries carry a timestamp and never contain secrets in meta or reason", () => {
    const e = auditEntry({ actor: "owner", action: "login", outcome: "deny", reason: "bad token sk-abcdefghijklmnopqrstuv", meta: { password: "x", attempts: 3 } }, new Date("2026-11-15T10:00:00Z"));
    expect(e.ts).toBe("2026-11-15T10:00:00.000Z");
    expect(JSON.stringify(e)).not.toContain("sk-abcdefghijklmnopqrstuv");
    expect(e.meta).toEqual({ password: "[redacted]", attempts: 3 });
  });
});
