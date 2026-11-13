import type { LocalizedText } from "@/lib/localized";

/**
 * Learning paths for the Knowledge Graph. Each path is a chain: step 1 → step 2 → …, drawn as connected nodes.
 * The graph also draws, automatically and from real data: projects → technologies (with evidence) and note → related note.
 *
 * To add your own chain (for example: Java → OOP → Design Patterns → SOLID → Clean Architecture), add a path below.
 * A step may link to a page on this site with `href` (e.g. "/garden/oop-notes"); without `href` it is a plain topic node.
 * Nothing here is invented: the two seeded paths are the structure of this site and the JLPT levels the owner has stated.
 */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });

export interface PathStep { id: string; label: LocalizedText; href?: string; note?: LocalizedText }
export interface LearningPath { id: string; title: LocalizedText; steps: PathStep[] }

export const paths: LearningPath[] = [
  {
    id: "japanese-route",
    title: L("Japanese route on this site", "このサイトでの日本語ルート", "Lộ trình tiếng Nhật trên trang này"),
    steps: [
      { id: "jp-kana", label: L("Kana", "かな", "Kana"), href: "/japanese/kana", note: L("Hiragana and katakana charts.", "ひらがなとカタカナの表。", "Bảng hiragana và katakana.") },
      { id: "jp-review", label: L("Vocabulary & kanji cards", "語彙・漢字カード", "Thẻ từ vựng & kanji"), href: "/japanese/review", note: L("Spaced-repetition flashcards.", "間隔反復のフラッシュカード。", "Flashcard lặp lại ngắt quãng.") },
      { id: "jp-grammar", label: L("Grammar", "文法", "Ngữ pháp"), href: "/japanese/grammar", note: L("Particles, verbs and useful phrases.", "助詞、動詞、便利な表現。", "Trợ từ, động từ và cụm từ hữu ích.") },
      { id: "jp-station", label: L("Station missions", "駅のミッション", "Nhiệm vụ ở Nhà ga"), href: "/station", note: L("Quizzes and conversation practice.", "クイズと会話練習。", "Câu đố và luyện hội thoại.") },
    ],
  },
  {
    id: "jlpt",
    title: L("JLPT levels", "JLPT のレベル", "Các cấp JLPT"),
    steps: [
      { id: "jlpt-n3", label: L("JLPT N3 (passed)", "JLPT N3（合格）", "JLPT N3 (đã đậu)"), href: "/japanese", note: L("Stated by the site owner; no date given.", "持ち主の申告。日付は未提供。", "Do chủ trang cho biết; chưa có ngày.") },
      { id: "jlpt-n2", label: L("JLPT N2 (in progress)", "JLPT N2（学習中）", "JLPT N2 (đang học)"), href: "/station", note: L("The current goal.", "現在の目標。", "Mục tiêu hiện tại.") },
      { id: "jlpt-n1", label: L("JLPT N1 (long-term)", "JLPT N1（長期目標）", "JLPT N1 (dài hạn)"), href: "/japanese", note: L("A long-term goal.", "長期的な目標。", "Mục tiêu dài hạn.") },
    ],
  },
];
