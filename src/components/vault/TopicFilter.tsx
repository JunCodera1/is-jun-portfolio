"use client";

import { useState } from "react";

/** Topic chips that show or hide children carrying data-topic. Pure CSS does the hiding (see globals.css), so every entry stays in the HTML. */
export function TopicFilter({ topics, allLabel, label, children }: { topics: { id: string; label: string }[]; allLabel: string; label: string; children: React.ReactNode }) {
  const [topic, setTopic] = useState("all");
  return (
    <div>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={topic === "all"} onClick={() => setTopic("all")}>{allLabel}</button>
        {topics.map((t) => (<button key={t.id} type="button" className="chip" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)}>{t.label}</button>))}
      </div>
      <div data-active-topic={topic}>{children}</div>
    </div>
  );
}
