import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    // Every key must exist in every locale (enforced by tests/unit/messages.test.ts),
    // so there is never a silent English fallback inside the UI chrome.
    messages: (await import(`../../messages/${locale}.json`)).default,
    // A missing or malformed message must fail the build, never render a raw key to a visitor.
    onError(error) {
      throw error;
    },
  };
});
