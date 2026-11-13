/**
 * The simulated terminal (row 26). It is a lookup table over precomputed, site-owned output.
 * There is no eval, no shell, no network and no file access: an unknown command only ever prints an error.
 */
export interface TLine { text: string; href?: string }

export interface TerminalData {
  commands: { name: string; description: string }[];
  outputs: Record<string, TLine[]>;
  labels: { unknown: string; helpTitle: string; help: string; hiddenHint?: string; usage?: { theme: string; lang: string; go: string } };
}

/** Things the terminal may ask the page to do. They are chosen from a fixed list, never from user text. */
export type TAction =
  | { type: "theme"; value: "light" | "dark" | "auto" | "system" }
  | { type: "lang"; value: "en" | "ja" | "vi" }
  | { type: "go"; value: string }
  | { type: "surprise" }
  | { type: "exit" };

export interface TerminalResult { lines: TLine[]; clear: boolean; action?: TAction }

/** `go <place>` targets (locale-less paths). */
export const GO_TARGETS: Record<string, string> = {
  home: "/classic", classic: "/classic", city: "/city", hideout: "/hideout", lab: "/lab", station: "/station", arcade: "/arcade", archive: "/archive",
  news: "/news", library: "/library", graph: "/graph", vault: "/vault", observatory: "/observatory", japanese: "/japanese", review: "/japanese/review",
  projects: "/projects", about: "/about", garden: "/garden", journal: "/journal", now: "/now", contact: "/contact", timeline: "/timeline",
};
const THEMES = ["light", "dark", "auto", "system"] as const;
const LANGS = ["en", "ja", "vi"] as const;

export const COMMAND_NAMES = ["help", "about", "projects", "skills", "interests", "journal", "garden", "now", "contact", "theme", "lang", "go", "surprise", "clear"] as const;

const MAX_ECHO = 40;

export function runCommand(raw: string, data: TerminalData): TerminalResult {
  const parts = raw.trim().split(/\s+/);
  const token = parts[0]?.toLowerCase() ?? "";
  const arg = parts[1]?.toLowerCase() ?? "";
  if (token === "") return { lines: [], clear: false };
  if (token === "clear") return { lines: [], clear: true };
  if (token === "exit" || token === "quit") return { lines: [], clear: false, action: { type: "exit" } };
  if (token === "surprise") return { lines: [{ text: "…" }], clear: false, action: { type: "surprise" } };

  // commands that do something: the argument must be one of a fixed list
  const usage = data.labels.usage;
  if (token === "theme") {
    const v = THEMES.find((x) => x === arg);
    return v ? { lines: [{ text: `theme → ${v}` }], clear: false, action: { type: "theme", value: v } } : { lines: [{ text: usage?.theme ?? "usage: theme light|dark|auto|system" }], clear: false };
  }
  if (token === "lang") {
    const v = LANGS.find((x) => x === arg);
    return v ? { lines: [{ text: `lang → ${v}` }], clear: false, action: { type: "lang", value: v } } : { lines: [{ text: usage?.lang ?? "usage: lang en|ja|vi" }], clear: false };
  }
  if (token === "go") {
    const path = Object.hasOwn(GO_TARGETS, arg) ? GO_TARGETS[arg] : undefined;
    return path ? { lines: [{ text: `go → ${arg}` }], clear: false, action: { type: "go", value: path } } : { lines: [{ text: usage?.go ?? `usage: go ${Object.keys(GO_TARGETS).join("|")}` }], clear: false };
  }

  if (token === "help") {
    const width = Math.max(...data.commands.map((c) => c.name.length)) + 2;
    return {
      clear: false,
      lines: [
        { text: data.labels.helpTitle },
        ...data.commands.map((c) => ({ text: `  ${c.name.padEnd(width)}${c.description}` })),
        ...(data.labels.hiddenHint ? [{ text: "" }, { text: data.labels.hiddenHint }] : []),
      ],
    };
  }

  // Object.hasOwn: "constructor", "__proto__" etc. are NOT commands.
  if (Object.hasOwn(data.outputs, token)) return { lines: data.outputs[token]!, clear: false };

  const shown = token.length > MAX_ECHO ? `${token.slice(0, MAX_ECHO)}…` : token;
  return { lines: [{ text: data.labels.unknown.replace("{cmd}", shown) }], clear: false };
}
