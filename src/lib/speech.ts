"use client";

/** Browser speech (Web Speech API). Never autoplays: only called from a button press. Quality and voice availability depend on the visitor's device. */
export const speechSupported = (): boolean => typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";

export function speakJa(text: string): void {
  if (!speechSupported()) return;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.85;
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("ja"));
    if (voice) u.voice = voice;
    synth.speak(u);
  } catch { /* speech is optional */ }
}
