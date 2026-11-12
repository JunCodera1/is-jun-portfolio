import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * `/` and any path without a locale prefix is redirected using, in order:
 * the saved NEXT_LOCALE cookie → the browser's Accept-Language → English.
 * Browser language is only an *initial* suggestion: once a visitor uses the
 * language switcher the choice is stored in the cookie and wins (row 8).
 * Explicit /en, /ja, /vi URLs are never redirected.
 */
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, API routes and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
