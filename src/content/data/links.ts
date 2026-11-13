import type { LocalizedText } from "@/lib/localized";

/**
 * Bookmarks. Public reference sites only — these are not claims about the owner's habits.
 * Add your own: { id, title, url, note? } under any group (or add a new group and a `links.groups.<id>` message key).
 */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });

export interface LinkItem { id: string; title: string; url: string; note?: LocalizedText }
export interface LinkGroup { id: "japanese" | "code" | "linux" | "ai"; items: LinkItem[] }

export const linkGroups: LinkGroup[] = [
  { id: "japanese", items: [
    { id: "jisho", title: "Jisho", url: "https://jisho.org/", note: L("Japanese–English dictionary.", "和英・英和辞典。", "Từ điển Nhật–Anh.") },
    { id: "nhk-easy", title: "NHK NEWS WEB EASY", url: "https://www3.nhk.or.jp/news/easy/", note: L("News in simple Japanese.", "やさしい日本語のニュース。", "Tin tức bằng tiếng Nhật đơn giản.") },
    { id: "jlpt", title: "JLPT official site", url: "https://www.jlpt.jp/e/", note: L("The exam's official information.", "試験の公式情報。", "Thông tin chính thức của kỳ thi.") },
    { id: "bunpro", title: "Bunpro", url: "https://bunpro.jp/", note: L("Grammar study with spaced repetition.", "間隔反復による文法学習。", "Học ngữ pháp bằng lặp lại ngắt quãng.") },
    { id: "tae-kim", title: "Tae Kim's Guide", url: "https://guidetojapanese.org/learn/", note: L("A free grammar guide.", "無料の文法ガイド。", "Hướng dẫn ngữ pháp miễn phí.") },
  ] },
  { id: "code", items: [
    { id: "mdn", title: "MDN Web Docs", url: "https://developer.mozilla.org/", note: L("Web platform reference.", "Web 技術のリファレンス。", "Tài liệu tham khảo cho nền tảng web.") },
    { id: "roadmap", title: "roadmap.sh", url: "https://roadmap.sh/", note: L("Learning roadmaps for developers.", "開発者向けの学習ロードマップ。", "Lộ trình học cho lập trình viên.") },
    { id: "cppref", title: "cppreference", url: "https://en.cppreference.com/", note: L("C and C++ reference.", "C/C++ のリファレンス。", "Tài liệu tham khảo C/C++.") },
  ] },
  { id: "linux", items: [
    { id: "arch-wiki", title: "ArchWiki", url: "https://wiki.archlinux.org/", note: L("Excellent Linux documentation.", "優れた Linux ドキュメント。", "Tài liệu Linux rất tốt.") },
    { id: "nixos", title: "NixOS manual", url: "https://nixos.org/manual/nixos/stable/", note: L("The official NixOS manual.", "NixOS 公式マニュアル。", "Sách hướng dẫn chính thức của NixOS.") },
    { id: "hyprland", title: "Hyprland wiki", url: "https://wiki.hypr.land/", note: L("Compositor documentation.", "コンポジタのドキュメント。", "Tài liệu về compositor.") },
  ] },
  { id: "ai", items: [
    { id: "hf", title: "Hugging Face", url: "https://huggingface.co/", note: L("Models, datasets and docs.", "モデル、データセット、ドキュメント。", "Mô hình, bộ dữ liệu và tài liệu.") },
    { id: "d2l", title: "Dive into Deep Learning", url: "https://d2l.ai/", note: L("A free interactive textbook.", "無料のインタラクティブ教科書。", "Giáo trình tương tác miễn phí.") },
  ] },
];
