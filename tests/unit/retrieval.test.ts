import { describe, expect, it } from "vitest";
import { buildIndex, confidence, retrieve, search, tokenize, type Doc } from "@/core/retrieval";

const doc = (id: string, title: string, summary = "", over: Partial<Doc> = {}): Doc => ({ id, kind: "note", title, summary, tags: [], href: `/${id}`, source: "owner", provenance: { origin: "t" }, visibility: "public", authorship: "owner", status: "translated", lang: "en", ...over });
const corpus = [
  doc("py", "Python for speech", "VoiceAI uses Python, SpeechBrain and Whisper to identify languages.", { tags: ["python", "ai"] }),
  doc("ts", "TypeScript web app", "Green Footprint is a React and TypeScript application.", { tags: ["typescript"] }),
  doc("jp", "日本語の勉強", "JLPT N3 に合格し、N2 を目指しています。"),
  doc("vi", "Đồ thị kiến thức", "Cách các dự án và công nghệ kết nối với nhau."),
  doc("secret", "Python secret plans", "private python notes", { visibility: "private" }),
  doc("hard", "Restricted python", "python python python", { visibility: "restricted" }),
];

describe("tokenizer", () => {
  it("folds case, width and accents; drops stopwords; keeps tech tokens like c++ and node.js", () => {
    expect(tokenize("What is the Đồ Thị?")).toEqual(["do", "thi"]);
    expect(tokenize("C++ and Node.js, ＴＳ")).toEqual(["c++", "node.js", "ts"]);
  });
  it("indexes Japanese as character bigrams (single characters when alone)", () => {
    expect(tokenize("日本語")).toEqual(["日本", "本語"]);
    expect(tokenize("N3に合格")).toEqual(["n3", "に合", "合格"]);
    expect(tokenize("猫")).toEqual(["猫"]);
  });
});

describe("BM25 ranking", () => {
  const idx = buildIndex(corpus.filter((d) => d.visibility === "public"));
  it("ranks the title/tag match first and reports matched terms", () => {
    const { hits } = search(idx, "python speech");
    expect(hits[0]!.doc.id).toBe("py"); expect(hits[0]!.matched).toEqual(["python", "speech"]);
  });
  it("finds Japanese and Vietnamese content with natural queries, with or without accents", () => {
    expect(search(idx, "日本語").hits[0]!.doc.id).toBe("jp");
    expect(search(idx, "JLPT N2").hits[0]!.doc.id).toBe("jp");
    expect(search(idx, "do thi kien thuc").hits[0]!.doc.id).toBe("vi");
    expect(search(idx, "Đồ thị").hits[0]!.doc.id).toBe("vi");
  });
  it("returns nothing for unknown terms, is deterministic, and respects the limit", () => {
    expect(search(idx, "zzzzqqq").hits).toEqual([]);
    expect(search(idx, "python typescript", 1).hits).toHaveLength(1);
    expect(search(idx, "web application")).toEqual(search(idx, "web application"));
  });
});

describe("permission-aware retrieval", () => {
  it("a visitor never sees private or restricted documents, even when they match best", () => {
    const r = retrieve(corpus, "python", { type: "visitor" });
    expect(r.hits.map((h) => h.doc.id)).toEqual(["py"]); expect(r.searched).toBe(4);
  });
  it("an agent reads private but never restricted; the owner reads everything", () => {
    expect(retrieve(corpus, "python", { type: "agent", id: "a", level: 2 }).hits.map((h) => h.doc.id).sort()).toEqual(["py", "secret"]);
    expect(retrieve(corpus, "python", { type: "owner" }).hits.map((h) => h.doc.id).sort()).toEqual(["hard", "py", "secret"]);
  });
});

describe("confidence heuristic", () => {
  it("is 0 with no hits, high when the top hit covers the query clearly, lower for partial coverage", () => {
    const idx = buildIndex(corpus.filter((d) => d.visibility === "public"));
    expect(confidence(["x"], [])).toBe(0);
    const full = search(idx, "python speech"); const part = search(idx, "python quantum");
    expect(confidence(full.terms, full.hits)).toBeGreaterThan(0.7);
    expect(confidence(part.terms, part.hits)).toBeLessThan(confidence(full.terms, full.hits));
  });
});
