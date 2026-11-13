import type { Locale } from "@/i18n/routing";
import { getTerminalData } from "@/lib/terminal-data";
import { TerminalOverlay } from "@/components/interactive/TerminalOverlay";

export async function TerminalMount({ locale }: { locale: Locale }) {
  return <TerminalOverlay data={await getTerminalData(locale)} />;
}
