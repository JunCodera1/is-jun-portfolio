"use client";

import { useEffect } from "react";
import type { DiscoveryId } from "@/content/data/world";
import { useWorld } from "./WorldProvider";

/** Marks a place as visited (local exploration progress). Renders nothing. */
export function Visit({ id }: { id: DiscoveryId }) {
  const { discover } = useWorld();
  useEffect(() => { discover(id); }, [discover, id]);
  return null;
}
