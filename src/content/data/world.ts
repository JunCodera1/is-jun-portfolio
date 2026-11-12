/** The world's places. Add a place here (and a scene + messages) and it appears in the HUD, palette, search and sitemap. */
export type PlaceId = "hideout" | "lab" | "station" | "arcade" | "archive";

export interface Place {
  id: PlaceId;
  href: string;
  /** Hotspot box over the 1600×900 city art, in percent. */
  box: { x: number; y: number; w: number; h: number };
}

export const places: Place[] = [
  { id: "hideout", href: "/hideout", box: { x: 6.9, y: 51, w: 15, h: 34 } },
  { id: "lab", href: "/lab", box: { x: 26.2, y: 32, w: 14.4, h: 53 } },
  { id: "station", href: "/station", box: { x: 41.9, y: 60, w: 22.5, h: 25.5 } },
  { id: "arcade", href: "/arcade", box: { x: 65.6, y: 52, w: 15.6, h: 33 } },
  { id: "archive", href: "/archive", box: { x: 83, y: 39, w: 12.5, h: 46.7 } },
];

/** Hidden points of interest in the city (centres, in percent of the art). */
export const secrets = [
  { id: "cat", x: 38.2, y: 40 },
  { id: "vending", x: 5.4, y: 80.5 },
  { id: "card", x: 61.5, y: 87.5 },
] as const;

/** Everything the exploration tracker knows about. This is progress through THIS WEBSITE only. */
export const DISCOVERIES = [
  "place-hideout", "place-lab", "place-station", "place-arcade", "place-archive",
  "cat", "vending", "card", "objects", "mission", "game", "backstage",
] as const;
export type DiscoveryId = (typeof DISCOVERIES)[number];
