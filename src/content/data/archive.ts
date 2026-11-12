import type { LocalizedText } from "@/lib/localized";

/** The Archive: shelves of things the owner likes. Only items the owner stated, or that exist verifiably (a repository), appear. */
const L = (en: string, ja: string, vi: string): LocalizedText => ({ en, ja: { text: ja, status: "draft" }, vi: { text: vi, status: "draft" } });

export interface ArchiveItem {
  id: string;
  title: LocalizedText;
  note: LocalizedText;
  /** Where the fact comes from. */
  source: "owner" | "github" | "public";
  url?: string;
  color: "red" | "white" | "gray";
}
export interface Shelf { id: "anime" | "tools" | "learning" | "books" | "music"; items: ArchiveItem[] }

const GH = "https://github.com/JunCodera1";

export const archiveShelves: Shelf[] = [
  {
    id: "anime",
    items: [
      { id: "hxh", title: L("Hunter × Hunter", "HUNTER×HUNTER", "Hunter × Hunter"), note: L("An anime and manga the owner enjoys.", "持ち主が好きなアニメ・マンガ。", "Anime và manga mà chủ trang yêu thích."), source: "owner", color: "red" },
      { id: "hisoka", title: L("Hisoka", "ヒソカ", "Hisoka"), note: L("One of the owner's favourite characters.", "持ち主のお気に入りのキャラクターのひとり。", "Một trong những nhân vật yêu thích của chủ trang."), source: "owner", color: "white" },
    ],
  },
  {
    id: "tools",
    items: [
      { id: "nixos", title: L("NixOS configuration", "NixOS の設定", "Cấu hình NixOS"), note: L("A public repository: myNixOS-config.", "公開リポジトリ：myNixOS-config。", "Repository công khai: myNixOS-config."), source: "github", url: `${GH}/myNixOS-config`, color: "gray" },
      { id: "neovim", title: L("Neovim configuration (fork)", "Neovim の設定（フォーク）", "Cấu hình Neovim (fork)"), note: L("A forked repository: neovim-config.", "フォークしたリポジトリ：neovim-config。", "Repository đã fork: neovim-config."), source: "github", url: `${GH}/neovim-config`, color: "red" },
      { id: "hyprdots", title: L("Hyprland dotfiles (fork)", "Hyprland の dotfiles（フォーク）", "Dotfiles Hyprland (fork)"), note: L("A forked repository: hyprdots.", "フォークしたリポジトリ：hyprdots。", "Repository đã fork: hyprdots."), source: "github", url: `${GH}/hyprdots`, color: "white" },
    ],
  },
  {
    id: "learning",
    items: [
      { id: "jisho", title: L("Jisho", "Jisho", "Jisho"), note: L("Online Japanese dictionary (public reference).", "オンライン日本語辞典（公開されている参考サイト）。", "Từ điển tiếng Nhật trực tuyến (nguồn tham khảo công khai)."), source: "public", url: "https://jisho.org/", color: "white" },
      { id: "nhk", title: L("NHK News Web Easy", "NHK NEWS WEB EASY", "NHK News Web Easy"), note: L("News in simple Japanese (public reference).", "やさしい日本語のニュース（公開されている参考サイト）。", "Tin tức bằng tiếng Nhật đơn giản (nguồn tham khảo công khai)."), source: "public", url: "https://www3.nhk.or.jp/news/easy/", color: "red" },
      { id: "jlpt", title: L("JLPT official site", "JLPT 公式サイト", "Trang chính thức JLPT"), note: L("Japanese-Language Proficiency Test (public reference).", "日本語能力試験（公開されている参考サイト）。", "Kỳ thi năng lực Nhật ngữ (nguồn tham khảo công khai)."), source: "public", url: "https://www.jlpt.jp/e/", color: "gray" },
    ],
  },
  {
    id: "books",
    items: [
      { id: "books-repo", title: L("Shared programming books", "プログラミング書籍の共有", "Sách lập trình chia sẻ"), note: L("A public repository: Share_Programming_Books.", "公開リポジトリ：Share_Programming_Books。", "Repository công khai: Share_Programming_Books."), source: "github", url: `${GH}/Share_Programming_Books`, color: "red" },
    ],
  },
  { id: "music", items: [] },
];
