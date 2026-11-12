import type { LocalizedText } from "@/lib/localized";

/** Where a fact came from. Only `github-*` and `owner` may render as fact; `placeholder` renders as a labelled slot. */
export type Provenance = "owner" | "github-manifest" | "github-api" | "placeholder";

export interface SocialLink {
  id: "github" | "linkedin" | "x" | "email" | string;
  label: string;
  url: string;
  /** Only confirmed links are rendered. Unconfirmed candidates live in CONTENT_NEEDED.md, not here. */
  confirmed: true;
}

export interface NavItem {
  id: string;
  href: string; // locale-less path, "" = home
  /** Key under the `nav` namespace in messages/*.json */
  labelKey: string;
  /** Key under `nav.desc` used by the Index on the home page */
  /** "sub" pages are reachable via search/palette/sitemap but are not listed in menus or the footer. */
  group: "personal" | "professional" | "utility" | "sub";
  primary?: boolean;
}

export type ProjectKind = "web" | "mobile" | "backend" | "ml" | "database" | "desktop" | "extension";

export interface StackItem {
  name: string;
  /** File/path in the repository that proves this item (shown to visitors). */
  evidence: string;
  repo: string;
}

export type CaseStudySection =
  | "overview" | "problem" | "goals" | "role" | "stack" | "architecture"
  | "implementation" | "challenges" | "results" | "lessons";

export interface Project {
  slug: string;
  name: string;
  kinds: ProjectKind[];
  /** Repositories (owner/name) that make up the project; the first is primary. */
  repos: string[];
  /** One-paragraph description. Written from verified evidence only. */
  summary: LocalizedText;
  /** Technical highlights, each verifiable in the repo. */
  highlights: LocalizedText[];
  stack: StackItem[];
  /** Case-study sections the owner (or verified evidence) has filled in. Missing = rendered as an owner-needed slot. */
  caseStudy: Partial<Record<CaseStudySection, LocalizedText>>;
  demo?: { url: string; checkedAt: string };
  /** Owner-controlled status. Left undefined until confirmed. */
  status?: "in-progress" | "shipped" | "paused" | "archived";
  featured: boolean;
}
