/** Audit entries and secret redaction. Pure; persistence is the store's job. */
export interface AuditEntry {
  ts: string;
  actor: string;
  action: string;
  resource?: string;
  outcome: "allow" | "deny" | "needs-approval" | "ok" | "error";
  reason?: string;
  meta?: Record<string, string | number | boolean | null>;
}

const SECRET_KEY = /(pass(word)?|secret|token|api[-_]?key|authorization|cookie|credential)/i;
const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/g;
const LONG_TOKEN = /\b(?:sk|ghp|gho|github_pat|xox[bp]|AKIA)[-_A-Za-z0-9]{12,}\b/g;

/** Remove anything that looks like a credential before it reaches a log, an error message or a response. */
export function redact(input: unknown, depth = 0): unknown {
  if (typeof input === "string") return input.replace(BEARER, "$1 [redacted]").replace(LONG_TOKEN, "[redacted]");
  if (depth > 4 || input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map((x) => redact(x, depth + 1));
  return Object.fromEntries(Object.entries(input as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEY.test(k) ? "[redacted]" : redact(v, depth + 1)]));
}

export const auditEntry = (e: Omit<AuditEntry, "ts">, now = new Date()): AuditEntry => ({ ts: now.toISOString(), ...e, ...(e.meta ? { meta: redact(e.meta) as AuditEntry["meta"] } : {}), ...(e.reason ? { reason: String(redact(e.reason)) } : {}) });
