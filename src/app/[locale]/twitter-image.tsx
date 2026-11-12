import { routing } from "@/i18n/routing";
import Image, { alt, contentType, size } from "./opengraph-image";

export { alt, contentType, size };
export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));
export default Image;
