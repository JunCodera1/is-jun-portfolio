import "server-only";
import { anilist, deezer, openlibrary, runIntegration } from "@/core/integrations";
import type { LibEntry } from "@/lib/library";

/** Thin facades over the library integrations; each returns [] when its service is unavailable. */
export const trendingAnime = async (n = 12): Promise<LibEntry[]> => (await runIntegration(anilist, { op: "trending", n })).data ?? [];
/** Look up one title the owner named, so its card carries real public data (year, score, link). */
export const lookupAnime = async (search: string): Promise<LibEntry[]> => (await runIntegration(anilist, { op: "lookup", search })).data ?? [];
export const trendingBooks = async (n = 12): Promise<LibEntry[]> => (await runIntegration(openlibrary, { op: "trending", n })).data ?? [];
export const techBooks = async (n = 12): Promise<LibEntry[]> => (await runIntegration(openlibrary, { op: "tech", n })).data ?? [];
export const musicChart = async (n = 12): Promise<LibEntry[]> => (await runIntegration(deezer, { op: "chart", n })).data ?? [];
