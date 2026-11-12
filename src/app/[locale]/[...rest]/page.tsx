import { notFound } from "next/navigation";

/** Any unknown path under a valid locale renders the localized 404 (inside the normal layout). */
export default function CatchAll() {
  notFound();
}
