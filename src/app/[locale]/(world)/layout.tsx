import { setRequestLocale } from "next-intl/server";
import { WorldProvider } from "@/components/world/WorldProvider";
import { WorldHud } from "@/components/world/WorldHud";

/** The immersive world: no conventional header/footer. A heads-up display and a transition layer instead. */
export default async function WorldLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <WorldProvider>
      <WorldHud />
      <main id="main" tabIndex={-1} className="min-h-dvh outline-none">{children}</main>
    </WorldProvider>
  );
}
