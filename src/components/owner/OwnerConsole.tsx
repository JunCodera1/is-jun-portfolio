"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface Agent { id: string; name: string; description: string; level: number; levelName: string; tools: string[] }
interface Task { id: string; agent: string; status: string; startedAt: string; steps: number; summary?: string; error?: string }
interface Proposal { id: string; agent: string; kind: string; title: string; rationale: string; evidence: string[]; patch?: string; draft?: { text: string; authorship: string; reviewStatus: string }; status: string; createdAt: string }
interface Health { id: string; status: string; source: string; latencyMs: number; error?: string }
interface State { agents: Agent[]; tasks: Task[]; proposals: Proposal[]; audit: { ts: string; actor: string; action: string; outcome: string; reason?: string }[]; health: Health[]; ai: { provider: string; budget: Record<string, number> }; integrations: { id: string; name: string; auth: string; scopes: string[]; hosts: string[] }[] }

const post = (path: string, body: unknown = {}) => fetch(`/api/owner/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** The owner's private console: run agents, review what they propose, see what happened, export or delete the data. Nothing here changes the public site. */
export function OwnerConsole() {
  const t = useTranslations("owner");
  const [state, setState] = useState<State | null>(null);
  const [auth, setAuth] = useState<"checking" | "in" | "out">("checking");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const r = await fetch("/api/owner/state", { cache: "no-store" });
    if (r.status === 401) { setAuth("out"); return; }
    if (r.ok) { setState((await r.json()) as State); setAuth("in"); }
  }, []);
  useEffect(() => {
    let live = true;
    fetch("/api/owner/state", { cache: "no-store" }).then(async (r) => { if (!live) return; if (r.status === 401) setAuth("out"); else if (r.ok) { setState((await r.json()) as State); setAuth("in"); } }).catch(() => { if (live) setAuth("out"); });
    return () => { live = false; };
  }, []);

  const act = async (key: string, f: () => Promise<Response>, ok = "") => { setBusy(key); setMsg(""); const r = await f(); setMsg(r.ok ? ok : t("failed", { code: r.status })); setBusy(""); await load(); };

  if (auth === "checking") return <p className="label">…</p>;
  if (auth === "out") return (
    <form className="max-w-sm" onSubmit={async (e) => { e.preventDefault(); const r = await post("login", { password: pw }); setPw(""); if (r.ok) await load(); else setMsg(r.status === 429 ? t("locked") : t("wrong")); }}>
      <label htmlFor="owner-pw" className="label block">{t("password")}</label>
      <input id="owner-pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-2 h-12 w-full border border-line-strong bg-transparent px-3 text-base text-fg outline-none focus:border-accent-fg" />
      <button type="submit" className="btn btn-primary mt-4" disabled={!pw}>{t("login")}</button>
      {msg && <p role="alert" className="label mt-3 !normal-case !tracking-normal">{msg}</p>}
    </form>
  );
  if (!state) return null;
  const pending = state.proposals.filter((p) => p.status === "pending");

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label !normal-case !tracking-normal">{t("ai")}: {state.ai.provider} · {t("requestsToday", { n: state.ai.budget.requests ?? 0 })}</p>
        <div className="flex gap-2">
          <a className="chip" href="/api/owner/export" download>{t("export")}</a>
          <button type="button" className="chip" onClick={() => act("logout", () => post("logout"))}>{t("logout")}</button>
        </div>
      </div>
      <p role="status" aria-live="polite" className="label min-h-5 !normal-case !tracking-normal">{msg}</p>

      <section aria-labelledby="o-agents"><h2 id="o-agents" className="text-3xl">{t("agents")}</h2><p className="label mt-1 !normal-case !tracking-normal">{t("agentsNote")}</p>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">{state.agents.map((a) => (
          <li key={a.id} className="card-ink p-4"><p className="label">{t("level", { n: a.level })} · {a.levelName}</p><h3 className="font-display text-xl">{a.name}</h3><p className="mt-1 text-sm text-fg-2">{a.description}</p><p className="label mt-2 !normal-case !tracking-normal">{t("tools")}: {a.tools.join(", ")}</p>
            <button type="button" className="btn mt-3" disabled={busy === a.id} onClick={() => act(a.id, () => post(`agents/${a.id}/run`), t("ran", { name: a.name }))}>{busy === a.id ? t("running") : t("run")}</button></li>))}</ul></section>

      <section aria-labelledby="o-prop"><h2 id="o-prop" className="text-3xl">{t("proposals")} <span className="label">{pending.length}</span></h2><p className="label mt-1 !normal-case !tracking-normal">{t("proposalsNote")}</p>
        {pending.length === 0 ? <p className="slot mt-4">{t("noProposals")}</p> : (
          <ul className="mt-4 space-y-4">{pending.map((p) => (
            <li key={p.id} className="card-ink p-4"><p className="label">{p.kind} · {p.agent}</p><h3 className="font-display text-xl [overflow-wrap:anywhere]">{p.title}</h3><p className="mt-1 text-fg-2">{p.rationale}</p>
              {p.evidence.length > 0 && <p className="label mt-1 !normal-case !tracking-normal">{t("evidence")}: {p.evidence.join(", ")}</p>}
              {p.patch && <pre className="mt-2 overflow-x-auto border border-line bg-surface-2 p-2 text-sm">{p.patch}</pre>}
              {p.draft && <div className="mt-2 border-2 border-dashed border-outline p-2"><p className="label">{t("aiDraft")}</p><p lang="ja" className="whitespace-pre-wrap">{p.draft.text}</p></div>}
              <div className="mt-3 flex gap-2"><button type="button" className="btn btn-primary" onClick={() => act(p.id, () => post(`proposals/${p.id}/approve`), t("approved"))}>{t("approve")}</button><button type="button" className="btn" onClick={() => act(p.id, () => post(`proposals/${p.id}/reject`), t("rejected"))}>{t("reject")}</button></div></li>))}</ul>)}</section>

      <section aria-labelledby="o-tasks"><h2 id="o-tasks" className="text-3xl">{t("tasks")}</h2>
        <ol className="mt-4 border-t-2 border-outline">{state.tasks.map((k) => (<li key={k.id} className="grid gap-x-4 border-b border-line py-2 sm:grid-cols-[9rem_10rem_minmax(0,1fr)]"><time className="label" dateTime={k.startedAt}>{k.startedAt.slice(0, 19).replace("T", " ")}</time><span className="label">{k.agent} · {k.status}</span><span className="text-sm [overflow-wrap:anywhere]">{k.summary ?? k.error ?? ""}</span></li>))}</ol></section>

      <section aria-labelledby="o-int"><h2 id="o-int" className="text-3xl">{t("integrations")}</h2><p className="label mt-1 !normal-case !tracking-normal">{t("integrationsNote")}</p>
        <ul className="mt-4 grid gap-x-8 sm:grid-cols-2">{state.integrations.map((i) => { const h = state.health.find((x) => x.id === i.id); return (
          <li key={i.id} className="flex items-baseline justify-between gap-3 border-b border-line py-2"><span><span className="font-display text-lg">{i.name}</span><span className="label block !normal-case !tracking-normal">{i.auth} · {i.scopes.join(", ")} · {i.hosts.join(", ")}{h ? ` · ${h.status} (${h.source}, ${h.latencyMs} ms)` : ""}</span></span>
            <button type="button" className="chip" onClick={() => act(i.id, () => post(`integrations/${i.id}/disconnect`), t("disconnected"))}>{t("disconnect")}</button></li>); })}</ul></section>

      <section aria-labelledby="o-audit"><h2 id="o-audit" className="text-3xl">{t("audit")}</h2>
        <ol className="mt-4 max-h-80 overflow-y-auto border-t-2 border-outline text-sm">{state.audit.map((a, i) => (<li key={i} className="grid gap-x-4 border-b border-line py-1 sm:grid-cols-[9rem_10rem_minmax(0,1fr)]"><time className="label" dateTime={a.ts}>{a.ts.slice(0, 19).replace("T", " ")}</time><span className="label">{a.actor}</span><span>{a.action} · {a.outcome}{a.reason ? ` · ${a.reason}` : ""}</span></li>))}</ol></section>

      <section aria-labelledby="o-data"><h2 id="o-data" className="text-3xl">{t("data")}</h2><p className="label mt-1 !normal-case !tracking-normal">{t("dataNote")}</p>
        <div className="mt-4 flex flex-wrap gap-2">{(["tasks", "proposals", "audit", "all"] as const).map((w) => (<button key={w} type="button" className="chip" onClick={() => { if (window.confirm(t("confirmPurge", { what: t(`purge_${w}`) }))) void act(`p-${w}`, () => post("purge", { confirm: "DELETE", what: w }), t("purged")); }}>{t(`purge_${w}`)}</button>))}</div></section>
    </div>
  );
}
