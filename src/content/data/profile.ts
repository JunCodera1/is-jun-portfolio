import type { LocalizedText } from "@/lib/localized";
import type { SocialLink } from "./types";

/**
 * Everything about the site owner lives here. Edit this file — never the components.
 * Fields that are not yet confirmed are `undefined` and render as clearly labelled placeholders.
 */
export const profile = {
  /** Supplied by the owner. */
  githubHandle: "JunCodera1",
  /** Display name, confirmed by the owner ("Hey, I'm Jun."). */
  displayName: "Jun",
  /** Set to true once the owner confirms the display name. Until then the open profile publishes `name: null`. */
  displayNameConfirmed: true,
  /** Publish /profile.json (only fields already shown on the site). Set to false to switch the endpoint off. */
  publishProfileJson: true,
  /** Used for the monogram in the header. */
  monogram: "J",
  tagline: {
    en: "Notes, projects and experiments — in three languages.",
    ja: { text: "ノート、プロジェクト、実験を、三つの言語で。", status: "draft" },
    vi: { text: "Ghi chú, dự án và các thử nghiệm — bằng ba ngôn ngữ.", status: "draft" },
  } satisfies LocalizedText,
  /** Short intro. PLACEHOLDER until the owner writes it. */
  intro: {
    en: "Curious by nature. Always exploring. Still becoming.",
    ja: { text: "生まれつき好奇心旺盛で、いつも探していて、まだ成長の途中です。", status: "draft" },
    vi: { text: "Tò mò từ bản tính. Luôn khám phá. Vẫn đang trở thành.", status: "draft" },
  } as LocalizedText | undefined,
  /** Stated by the owner (kept short and editable). */
  facts: [
    { en: "Fourth-year IT student from Vietnam", ja: { text: "ベトナム出身の IT 学部 4 年生", status: "draft" }, vi: { text: "Sinh viên CNTT năm 4, đến từ Việt Nam", status: "draft" } },
    { en: "Studying Information Technology", ja: { text: "情報技術を学んでいます", status: "draft" }, vi: { text: "Đang học Công nghệ thông tin", status: "draft" } },
    { en: "Enjoys software development, AI/ML and Linux experiments", ja: { text: "ソフトウェア開発、AI/ML、Linux での実験が好きです", status: "draft" }, vi: { text: "Thích phát triển phần mềm, AI/ML và thử nghiệm trên Linux", status: "draft" } },
    { en: "Learning Japanese: JLPT N3 passed, working toward N2", ja: { text: "日本語を勉強中：JLPT N3 合格、N2 を目指しています", status: "draft" }, vi: { text: "Đang học tiếng Nhật: đã đỗ JLPT N3, hướng tới N2", status: "draft" } },
  ] as LocalizedText[],
  /** Not supplied yet → rendered as a labelled placeholder, never as a fake mailto link. */
  email: undefined as string | undefined,
  location: undefined as string | undefined,
  avatar: undefined as { src: string; alt: LocalizedText } | undefined,
} as const;

export const socialLinks: SocialLink[] = [
  { id: "github", label: "GitHub", url: `https://github.com/${profile.githubHandle}`, confirmed: true },
];
