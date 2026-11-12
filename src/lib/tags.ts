/** Localized label for a tag id; unknown tags fall back to the id itself. */
export function tagLabel(t: { has: (k: string) => boolean; (k: string): string }, id: string): string {
  return t.has(`tagNames.${id}`) ? t(`tagNames.${id}`) : id;
}
