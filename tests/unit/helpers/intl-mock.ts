import en from "../../../messages/en.json";
import ja from "../../../messages/ja.json";
import vi from "../../../messages/vi.json";

/** next-intl's server API only works inside a Next.js request. This stand-in reads the real message files, so tests exercise real copy. */
const all: Record<string, unknown> = { en, ja, vi };
export const intlServerMock = {
  getTranslations: async ({ locale, namespace }: { locale: string; namespace?: string }) => {
    const dig = (key: string) => `${namespace ? `${namespace}.` : ""}${key}`.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), all[locale]);
    const t = (key: string, p: Record<string, unknown> = {}) => String(dig(key) ?? key).replace(/\{(\w+)[^}]*\}/g, (_m, k) => String(p[k] ?? ""));
    t.has = (key: string) => dig(key) !== undefined;
    return t;
  },
};
