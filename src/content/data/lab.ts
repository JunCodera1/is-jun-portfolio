/** Field notes: verified repositories behind the owner's stated interests. "own" repos exist in the GitHub snapshot; "fork" repos exist as forks on the profile. Nothing here claims work done inside a fork. */
export interface FieldRepo { name: string; kind: "own" | "fork" }
export interface FieldNote { id: "linux" | "ai" | "ue"; repos: FieldRepo[] }
export const GITHUB_USER_URL = "https://github.com/JunCodera1";
export const fieldNotes: FieldNote[] = [
  { id: "linux", repos: [{ name: "myNixOS-config", kind: "own" }, { name: "hyprdots", kind: "fork" }, { name: "neovim-config", kind: "fork" }] },
  { id: "ai", repos: [{ name: "speech-language-model", kind: "own" }, { name: "EduVision", kind: "own" }, { name: "speechbrain", kind: "fork" }] },
  { id: "ue", repos: [{ name: "KawaiiPhysics", kind: "fork" }] },
];
