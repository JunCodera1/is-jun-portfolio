/**
 * The simulated terminal (row 26). It is a lookup table over precomputed, site-owned output.
 * There is no eval, no shell, no network and no file access: an unknown command only ever prints an error.
 */
export interface TLine { text: string; href?: string }

export interface TerminalData {
  commands: { name: string; description: string }[];
  outputs: Record<string, TLine[]>;
  labels: { unknown: string; helpTitle: string; help: string };
}

export interface TerminalResult { lines: TLine[]; clear: boolean }

export const COMMAND_NAMES = ["help", "about", "projects", "skills", "interests", "journal", "garden", "now", "contact", "clear"] as const;

const MAX_ECHO = 40;

export function runCommand(raw: string, data: TerminalData): TerminalResult {
  const token = raw.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (token === "") return { lines: [], clear: false };
  if (token === "clear") return { lines: [], clear: true };

  if (token === "help") {
    const width = Math.max(...data.commands.map((c) => c.name.length)) + 2;
    return {
      clear: false,
      lines: [
        { text: data.labels.helpTitle },
        ...data.commands.map((c) => ({ text: `  ${c.name.padEnd(width)}${c.description}` })),
      ],
    };
  }

  // Object.hasOwn: "constructor", "__proto__" etc. are NOT commands.
  if (Object.hasOwn(data.outputs, token)) return { lines: data.outputs[token]!, clear: false };

  const shown = token.length > MAX_ECHO ? `${token.slice(0, MAX_ECHO)}…` : token;
  return { lines: [{ text: data.labels.unknown.replace("{cmd}", shown) }], clear: false };
}
