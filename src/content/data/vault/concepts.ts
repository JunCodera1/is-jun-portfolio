import { L, type VaultTopic, type Visible } from "./types";
import type { LocalizedText } from "@/lib/localized";

/** Concept Explainer: a technical idea explained with a diagram and a worked example. Bodies are English; ja/vi titles and summaries are drafts. */
export type DiagramId = "leitner" | "csp" | "isr" | "layout";
export interface Concept extends Visible { id: string; topic: VaultTopic; diagram: DiagramId; title: LocalizedText; summary: LocalizedText; body: LocalizedText[]; example: { code: string; caption: LocalizedText }; related: string[] }

export const concepts: Concept[] = [
  {
    id: "spaced-repetition", topic: "japanese", diagram: "leitner",
    title: L("Spaced repetition with Leitner boxes", "ライトナー式の間隔反復", "Lặp lại ngắt quãng với hộp Leitner"),
    summary: L("Why flashcards that return at growing intervals beat cramming, and how five boxes implement it.", "間隔をあけて戻ってくるカードが詰め込みより効く理由と、5つの箱での実装。", "Vì sao flashcard quay lại với khoảng cách tăng dần hiệu quả hơn học nhồi, và cách 5 chiếc hộp làm điều đó."),
    body: [
      L("Memory fades on a curve: the longer since you last saw something, the less likely you are to recall it. Reviewing it just before it fades flattens that curve, so each review buys a longer wait."),
      L("The Leitner system turns this into five boxes. Every new card starts in box 1. When you remember a card it moves up one box and waits longer (1, 2, 4, 8, then 16 days). When you forget it, it goes straight back to box 1 and returns tomorrow."),
      L("A study session is then simple: take the cards that are due, oldest first, then a few new ones. Cards you know well almost disappear from your daily work; cards you struggle with keep coming back."),
      L("Try it below: the diagram uses the same function the review cards on this site use."),
    ],
    example: { code: "review(card, correct, today)\n  box   = correct ? min(5, box + 1) : 1\n  due   = today + [1, 2, 4, 8, 16][box]", caption: L("The whole algorithm. The site's version is in src/lib/srs.ts and is covered by unit tests.") },
    related: ["leitner", "spaced-repetition"],
  },
  {
    id: "content-security-policy", topic: "web", diagram: "csp",
    title: L("Content Security Policy", "コンテンツセキュリティポリシー", "Content Security Policy"),
    summary: L("A list, sent with every page, of where the browser may load things from. Anything not on the list is refused.", "ブラウザが何をどこから読み込んでよいかを、ページごとに送る一覧。載っていないものは拒否される。", "Danh sách gửi kèm mỗi trang cho biết trình duyệt được tải gì từ đâu. Thứ gì không có trong danh sách sẽ bị từ chối."),
    body: [
      L("Without a policy, a page will happily run any script it is told to load, including one injected by an attacker. A Content Security Policy is a response header that says which sources are allowed for scripts, images, frames, fonts and connections."),
      L("This site sends default-src 'self', so by default only its own origin is trusted. Each extra need is added on purpose: a few image hosts for cover art, three music players for frames, one CDN for audio previews."),
      L("The result is that a mistake (or an injected tag pointing at an unknown host) fails loudly in the console instead of silently running."),
    ],
    example: { code: "Content-Security-Policy:\n  default-src 'self';\n  img-src 'self' https://s4.anilist.co;\n  frame-src https://www.youtube-nocookie.com", caption: L("A trimmed version of the policy this site sends. The real one is in next.config.ts.") },
    related: ["csp"],
  },
  {
    id: "static-and-regenerated", topic: "web", diagram: "isr",
    title: L("Static pages that refresh themselves", "自分で更新する静的ページ", "Trang tĩnh tự làm mới"),
    summary: L("How a site can be fast like plain files and still show fresh news, using incremental regeneration.", "静的ファイルの速さのまま、新しいニュースも出せる仕組み（増分再生成）。", "Làm sao trang vừa nhanh như file tĩnh vừa hiện tin mới, nhờ tái tạo tăng dần."),
    body: [
      L("A static page is built once, ahead of time, and served as a finished file. That is as fast and as cheap as the web gets, but it goes stale."),
      L("Incremental static regeneration adds a timer. The page keeps being served instantly; once the timer runs out, the next visit triggers a rebuild in the background and later visitors get the new copy."),
      L("This site uses 30 minutes for the news, 6 hours for the library, and no timer at all for pages that never change."),
    ],
    example: { code: "export const revalidate = 1800; // seconds", caption: L("One line on a page is all it takes in Next.js. 1800 seconds = 30 minutes.") },
    related: ["ssg", "isr"],
  },
  {
    id: "graph-layout", topic: "general", diagram: "layout",
    title: L("How the knowledge graph places its nodes", "ナレッジグラフがノードを配置する方法", "Đồ thị kiến thức đặt các nút như thế nào"),
    summary: L("Every node pushes every other node away, every link pulls its two ends together, and the picture settles.", "どのノードも他のノードを押しのけ、リンクは両端を引き寄せ、やがて絵が落ち着く。", "Mỗi nút đẩy các nút khác ra, mỗi liên kết kéo hai đầu lại gần, rồi hình ổn định."),
    body: [
      L("Placing nodes by hand does not scale, so the graph page simulates physics. Nodes repel each other like charged particles; each link acts like a spring that pulls its two ends together."),
      L("The simulation starts from a fixed spiral instead of random positions and runs a fixed number of steps, so the result is the same on every build. A final pass pushes apart any labels that still overlap."),
      L("The idea is the Fruchterman–Reingold algorithm. The code is in src/lib/graph.ts and a unit test checks that no two labels overlap on the real data."),
    ],
    example: { code: "repulsion  f = k² / distance\nattraction f = distance² / k   (along links)", caption: L("The two forces. k is the ideal distance between neighbours.") },
    related: ["force-directed"],
  },
];
