"use client";

import { useState } from "react";

/** Filter chips for a list whose rows carry data-group. Hiding is CSS (see globals.css), so every row stays in the HTML. */
export function KindFilter({ groups, allLabel, label, children }: { groups: { id: string; label: string }[]; allLabel: string; label: string; children: React.ReactNode }) {
  const [g, setG] = useState("all");
  return (
    <div>
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        <button type="button" className="chip" aria-pressed={g === "all"} onClick={() => setG("all")}>{allLabel}</button>
        {groups.map((x) => (<button key={x.id} type="button" className="chip" aria-pressed={g === x.id} onClick={() => setG(x.id)}>{x.label}</button>))}
      </div>
      <div data-active-group={g}>{children}</div>
    </div>
  );
}
