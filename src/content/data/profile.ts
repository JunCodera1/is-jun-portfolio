import type { LocalizedText } from "@/lib/localized";
import type { SocialLink } from "./types";

/**
 * Everything about the site owner lives here. Edit this file — never the components.
 * Fields that are not yet confirmed are `undefined` and render as clearly labelled placeholders.
 */
export const profile = {
  /** Supplied by the owner. */
  githubHandle: "JunCodera1",
  /** UNCONFIRMED working name derived from the GitHub handle. Replace with the real display name. */
  displayName: "Jun",
  /** Used for the monogram in the header. */
  monogram: "J",
  tagline: {
    en: "Notes, projects and experiments — in three languages.",
    ja: { text: "ノート、プロジェクト、実験を、三つの言語で。", status: "draft" },
    vi: { text: "Ghi chú, dự án và các thử nghiệm — bằng ba ngôn ngữ.", status: "draft" },
  } satisfies LocalizedText,
  /** Short intro. PLACEHOLDER until the owner writes it. */
  intro: undefined as LocalizedText | undefined,
  /** Not supplied yet → rendered as a labelled placeholder, never as a fake mailto link. */
  email: undefined as string | undefined,
  location: undefined as string | undefined,
  avatar: undefined as { src: string; alt: LocalizedText } | undefined,
} as const;

export const socialLinks: SocialLink[] = [
  { id: "github", label: "GitHub", url: `https://github.com/${profile.githubHandle}`, confirmed: true },
];
