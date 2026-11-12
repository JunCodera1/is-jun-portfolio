import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";
import { profile } from "@/content/data/profile";

export const alt = "My Digital Space";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

/**
 * Social preview, generated at build time. Latin-only on purpose: the default OG font has no Japanese/Vietnamese
 * coverage, so every locale shares one image that cannot render as tofu.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0c0d10", color: "#f2f3f5", padding: 72, position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, letterSpacing: 4, color: "#8a909c", textTransform: "uppercase" }}>
          <span>My Digital Space</span>
          <span>EN · 日本語 · VI</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", fontSize: 300, lineHeight: 0.85, fontWeight: 600, letterSpacing: -12 }}>
          {profile.displayName}
          <span style={{ color: "#b8f36b" }}>.</span>
        </div>
        <div style={{ display: "flex", height: 10, width: 220, background: "#b8f36b" }} />
      </div>
    ),
    { ...size },
  );
}
