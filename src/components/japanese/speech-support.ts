import { speechSupported } from "@/lib/speech";

/** `useSyncExternalStore` source: whether the browser has speech synthesis (false on the server, so hydration matches). */
export const hasSpeechSnapshot = {
  subscribe: () => () => {},
  get: () => speechSupported(),
  server: () => false,
};
