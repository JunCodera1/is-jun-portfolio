/**
 * Skills are NOT scored. A technology appears here only because at least one project uses it,
 * and every link carries the evidence (a file or the GitHub language breakdown).
 * tests/unit/data.test.ts checks that every `slug` exists in projects.ts.
 */
export type SkillCategory = "languages" | "frontend" | "backend" | "mobile" | "data" | "tooling";

export interface Skill {
  name: string;
  category: SkillCategory;
  usedIn: { slug: string; evidence: string }[];
}

export const skills: Skill[] = [
  { name: "Kotlin", category: "languages", usedIn: [{ slug: "deepsea", evidence: "GitHub language breakdown (DeepSea 100%, DeepSea-RestAPI 74%)" }] },
  { name: "TypeScript", category: "languages", usedIn: [
    { slug: "green-footprint", evidence: "GitHub language breakdown (98% / 93%)" },
    { slug: "nexus-banking", evidence: "GitHub language breakdown (web/ app, 73%)" },
  ] },
  { name: "Python", category: "languages", usedIn: [
    { slug: "voiceai", evidence: "requirements.txt, train.py, web_app/server.py" },
    { slug: "eduvision", evidence: "desktop_app.py, realtime_detection.py" },
    { slug: "deplao", evidence: "requirements.txt, main.py" },
  ] },
  { name: "JavaScript", category: "languages", usedIn: [
    { slug: "yt-bilingual-subtitle", evidence: "content.js (GitHub: 89%)" },
    { slug: "deplao", evidence: "backend_chat/package.json" },
  ] },
  { name: "SQL / PL/pgSQL", category: "languages", usedIn: [{ slug: "nexus-banking", evidence: "init.sql (functions, triggers, view)" }] },

  { name: "React", category: "frontend", usedIn: [{ slug: "green-footprint", evidence: "package.json" }] },
  { name: "Next.js", category: "frontend", usedIn: [{ slug: "nexus-banking", evidence: "web/package.json" }] },
  { name: "Tailwind CSS", category: "frontend", usedIn: [{ slug: "green-footprint", evidence: "tailwind.config.js" }] },
  { name: "three.js", category: "frontend", usedIn: [{ slug: "green-footprint", evidence: "package.json (three, @react-three/fiber)" }] },
  { name: "PyQt6 / PySide6", category: "frontend", usedIn: [
    { slug: "eduvision", evidence: "requirements_app.txt (PyQt6)" },
    { slug: "deplao", evidence: "requirements.txt (PySide6)" },
  ] },

  { name: "Express (Node.js)", category: "backend", usedIn: [
    { slug: "green-footprint", evidence: "green-footprint-backend/src/server.ts" },
    { slug: "deplao", evidence: "backend_chat/package.json" },
  ] },
  { name: "Spring Boot", category: "backend", usedIn: [{ slug: "deepsea", evidence: "DeepSea-RestAPI/build.gradle.kts (3.4.4)" }] },
  { name: "FastAPI", category: "backend", usedIn: [{ slug: "voiceai", evidence: "web_app/server.py" }] },
  { name: "Socket.IO", category: "backend", usedIn: [{ slug: "deplao", evidence: "backend_chat/package.json" }] },
  { name: "Prisma", category: "backend", usedIn: [{ slug: "green-footprint", evidence: "src/database/prisma/schema.prisma" }] },

  { name: "Jetpack Compose", category: "mobile", usedIn: [{ slug: "deepsea", evidence: "app/build.gradle.kts (compose = true)" }] },
  { name: "Retrofit + Hilt", category: "mobile", usedIn: [{ slug: "deepsea", evidence: "app/build.gradle.kts" }] },

  { name: "PostgreSQL", category: "data", usedIn: [
    { slug: "green-footprint", evidence: "schema.prisma (provider = postgresql)" },
    { slug: "deepsea", evidence: "DeepSea-RestAPI/build.gradle.kts" },
    { slug: "nexus-banking", evidence: "init.sql, docker-compose.yml" },
    { slug: "deplao", evidence: "backend_chat/package.json (pg)" },
  ] },
  { name: "SpeechBrain / ECAPA-TDNN", category: "data", usedIn: [{ slug: "voiceai", evidence: "hparams.yaml" }] },
  { name: "Whisper (transformers)", category: "data", usedIn: [{ slug: "voiceai", evidence: "web_app/server.py" }] },
  { name: "TensorFlow / Keras + OpenCV", category: "data", usedIn: [{ slug: "eduvision", evidence: "requirements_app.txt, realtime_detection.py" }] },

  { name: "Docker", category: "tooling", usedIn: [
    { slug: "green-footprint", evidence: "green-footprint-backend/Dockerfile, docker-compose.yml" },
    { slug: "voiceai", evidence: "Dockerfile, compose.yaml" },
    { slug: "nexus-banking", evidence: "docker-compose.yml" },
  ] },
  { name: "Jest", category: "tooling", usedIn: [{ slug: "green-footprint", evidence: "green-footprint-backend/jest.config.js" }] },
  { name: "Nix", category: "tooling", usedIn: [{ slug: "green-footprint", evidence: "green-footprint-backend/flake.nix, shell.nix" }] },
  { name: "WebExtension packaging", category: "tooling", usedIn: [{ slug: "yt-bilingual-subtitle", evidence: "manifest.json, build.sh, release v6.0" }] },
];

export const skillCategories: SkillCategory[] = ["languages", "frontend", "backend", "mobile", "data", "tooling"];
