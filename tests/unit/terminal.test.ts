import { describe, expect, it } from "vitest";
import { COMMAND_NAMES, runCommand, type TerminalData } from "@/lib/terminal";

const data: TerminalData = {
  commands: COMMAND_NAMES.map((name) => ({ name, description: `desc ${name}` })),
  outputs: { about: [{ text: "about out" }], projects: [{ text: "P1", href: "/projects/p1" }] },
  labels: { unknown: "command not found: {cmd}. Type help.", helpTitle: "Available commands", help: "Show help" },
};

describe("simulated terminal (row 26: never runs a real shell)", () => {
  it("help lists every advertised command", () => {
    const out = runCommand("help", data).lines.map((l) => l.text).join("\n");
    for (const c of ["help", "about", "projects", "skills", "interests", "journal", "garden", "now", "contact", "clear"]) expect(out).toContain(c);
  });
  it("is case/whitespace tolerant and ignores arguments", () => {
    expect(runCommand("  ABOUT   now  ", data).lines).toEqual([{ text: "about out" }]);
  });
  it("clear asks the UI to clear and prints nothing", () => {
    expect(runCommand("clear", data)).toEqual({ lines: [], clear: true });
  });
  it("empty input is a no-op", () => {
    expect(runCommand("   ", data)).toEqual({ lines: [], clear: false });
  });
  it.each(["rm -rf /", "ls", "cat /etc/passwd", "curl http://x", "$(whoami)", "constructor", "__proto__", "toString", "hasOwnProperty"])(
    "treats %j as an unknown command and only prints an error", (cmd) => {
      const r = runCommand(cmd, data);
      expect(r.clear).toBe(false);
      expect(r.lines).toHaveLength(1);
      expect(r.lines[0]!.text).toMatch(/^command not found: /);
    });
  it("truncates very long unknown input in the echo", () => {
    const r = runCommand("x".repeat(500), data);
    expect(r.lines[0]!.text.length).toBeLessThan(100);
  });
});

describe("terminal commands that act (arguments come from fixed lists)", () => {
  const d: TerminalData = { ...data, outputs: { ...data.outputs, sudo: [{ text: "nice try" }] } };
  it("theme / lang / go return an action only for allowed values", () => {
    expect(runCommand("theme dark", d).action).toEqual({ type: "theme", value: "dark" });
    expect(runCommand("THEME auto", d).action).toEqual({ type: "theme", value: "auto" });
    expect(runCommand("lang ja", d).action).toEqual({ type: "lang", value: "ja" });
    expect(runCommand("go city", d).action).toEqual({ type: "go", value: "/city" });
    expect(runCommand("surprise", d).action).toEqual({ type: "surprise" });
    expect(runCommand("exit", d).action).toEqual({ type: "exit" });
  });
  it("bad arguments print usage and never produce an action (no paths, no URLs, no prototype keys)", () => {
    for (const bad of ["theme", "theme neon", "lang xx", "go", "go /etc/passwd", "go https://evil.example", "go __proto__", "go constructor", "go ../x"]) {
      const r = runCommand(bad, d);
      expect(r.action).toBeUndefined();
      expect(r.lines).toHaveLength(1);
    }
  });
  it("hidden commands come from the data table only", () => {
    expect(runCommand("sudo make me a sandwich", d).lines).toEqual([{ text: "nice try" }]);
    expect(runCommand("hisoka", d).lines[0]!.text).toMatch(/^command not found/);
  });
  it("help mentions that more exists when the data says so", () => {
    const withHint = { ...d, labels: { ...d.labels, hiddenHint: "psst" } };
    expect(runCommand("help", withHint).lines.map((l) => l.text)).toContain("psst");
  });
});
