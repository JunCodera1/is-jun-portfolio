import { L, type VaultTopic, type Visible } from "./types";
import type { LocalizedText } from "@/lib/localized";

/** Idea Incubator: ideas from first spark to shipped. Seeded with ideas for THIS site; add your own project ideas the same way. */
export type Stage = "spark" | "exploring" | "building" | "shipped" | "parked";
export const STAGES: Stage[] = ["spark", "exploring", "building", "shipped", "parked"];
export interface Idea extends Visible { id: string; stage: Stage; topic: VaultTopic; since: string; title: LocalizedText; pitch: LocalizedText; next: LocalizedText }

export const ideas: Idea[] = [
  { id: "project-explorer", stage: "exploring", topic: "web", since: "2026-11-13", title: L("Project explorer", "プロジェクトエクスプローラー", "Project explorer"), pitch: L("Interactive architecture diagrams: click a module to see its role and the data flow."), next: L("Pick one or two projects and read their code, so every box in the diagram can be backed by a file.") },
  { id: "listening-practice", stage: "spark", topic: "japanese", since: "2026-11-13", title: L("Listening practice", "リスニング練習", "Luyện nghe"), pitch: L("Short audio clips with questions, at N3 and N2 level."), next: L("Needs real recordings; the browser voice is only a stopgap.") },
  { id: "code-playground", stage: "spark", topic: "tooling", since: "2026-11-13", title: L("Code playground", "コードプレイグラウンド", "Sân chơi code"), pitch: L("Run small snippets next to a note."), next: L("Needs a real sandbox; running visitors' code in the page would not be safe.") },
  { id: "guestbook", stage: "parked", topic: "web", since: "2026-11-13", title: L("Guestbook", "ゲストブック", "Sổ lưu bút"), pitch: L("Let visitors leave a message."), next: L("Parked: needs persistent storage, moderation and abuse protection, and the site deliberately has no user-generated content.") },
  { id: "3d-workspace", stage: "parked", topic: "design", since: "2026-11-13", title: L("3D workspace", "3D ワークスペース", "Không gian làm việc 3D"), pitch: L("A 3D version of the hideout."), next: L("Parked: no value over the 2D room yet, and the site must never depend on it.") },
  { id: "vault", stage: "building", topic: "general", since: "2026-11-13", title: L("Knowledge Vault", "ナレッジ・ボルト", "Kho kiến thức"), pitch: L("One place for concepts, research, mistakes, decisions, ideas, a glossary, reading, learning and a roadmap."), next: L("Fill the empty modules (reading, learning log) with the owner's own entries.") },
  { id: "knowledge-graph", stage: "shipped", topic: "web", since: "2026-11-13", title: L("Knowledge graph", "ナレッジグラフ", "Đồ thị kiến thức"), pitch: L("How projects, technologies, notes and learning paths connect."), next: L("Add the owner's own learning chains as they are written down.") },
  { id: "playlists", stage: "shipped", topic: "general", since: "2026-11-13", title: L("Playable playlists", "再生できるプレイリスト", "Playlist nghe được"), pitch: L("Links from anywhere, playing on the page when chosen."), next: L("Add the owner's own tracks.") },
  { id: "spaced-repetition", stage: "shipped", topic: "japanese", since: "2026-11-13", title: L("Spaced-repetition cards", "間隔反復カード", "Thẻ lặp lại ngắt quãng"), pitch: L("Flashcards that return just before they are forgotten."), next: L("More vocabulary and grammar items.") },
];
