import "server-only";
import { translationAssistant, knowledgeOrganizer, integrationMonitor } from "@/core/agents/catalog";
import type { AgentDef, ToolDef } from "@/core/agents/runtime";
import { createTools } from "@/core/agents/tools";
import { runtime } from "@/core/ai/runtime";
import { createLimiter } from "@/core/auth/ratelimit";
import { refreshAll } from "@/core/integrations";
import { createFileStore, type Store } from "@/core/store";
import { env } from "@/lib/env";
import { locales } from "@/i18n/routing";
import { getKnowledgeAll } from "@/lib/knowledge/build";

export interface OwnerContext {
  secret: string; passwordHash: string; secure: boolean; store: Store; tools: ReadonlyMap<string, ToolDef>; agents: AgentDef[];
  running: Map<string, AbortController>; loginIp: ReturnType<typeof createLimiter>; loginAll: ReturnType<typeof createLimiter>; actions: ReturnType<typeof createLimiter>;
  aiProvider: string; budget: () => unknown;
}

let memo: Promise<OwnerContext | null> | undefined;

/**
 * The owner console exists only when it is fully configured: a password hash, a session secret and a writable data directory.
 * Anything missing and it is simply off (every owner route answers 404), so a misconfigured deployment can never be half-open.
 */
export function getOwnerContext(): Promise<OwnerContext | null> {
  memo ??= (async () => {
    if (!env.OWNER_PASSWORD_HASH || !env.SESSION_SECRET) return null;
    const store = await createFileStore(env.DATA_DIR ?? ".data");
    if (!store) return null;
    const tools = createTools({ knowledge: async () => getKnowledgeAll("en"), knowledgeFor: (l) => getKnowledgeAll(l as (typeof locales)[number]), model: runtime.model, refreshHealth: refreshAll, locales });
    return {
      secret: env.SESSION_SECRET, passwordHash: env.OWNER_PASSWORD_HASH, secure: (env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"), store, tools,
      agents: [knowledgeOrganizer, translationAssistant(!!runtime.model), integrationMonitor], running: new Map(),
      loginIp: createLimiter({ max: 5, windowMs: 15 * 60_000 }), loginAll: createLimiter({ max: 30, windowMs: 60 * 60_000 }), actions: createLimiter({ max: 20, windowMs: 60_000 }),
      aiProvider: runtime.model?.id ?? "extractive (no model)", budget: () => runtime.budget.snapshot(),
    };
  })();
  return memo;
}
