/** JSON Feed 1.1 (https://www.jsonfeed.org/version/1.1/). Pure: takes already-public data, returns the document. */
export interface FeedInput { title: string; homeUrl: string; feedUrl: string; description: string; language: string; items: { id: string; url: string; title: string; summary: string; date: string; tags: string[]; language: string }[] }

export function buildJsonFeed(i: FeedInput) {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: i.title,
    home_page_url: i.homeUrl,
    feed_url: i.feedUrl,
    description: i.description,
    language: i.language,
    items: [...i.items]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id)))
      .map((x) => ({ id: x.id, url: x.url, title: x.title, summary: x.summary || undefined, date_published: `${x.date}T00:00:00Z`, tags: x.tags, language: x.language })),
  };
}
