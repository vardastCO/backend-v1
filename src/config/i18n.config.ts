import {
  AcceptLanguageResolver,
  I18nOptions,
  QueryResolver,
} from "nestjs-i18n";
import { join } from "path";
import { UserLanguageResolver } from "src/i18n/user-language.resolver";

export const i18nConfig: I18nOptions = {
  fallbackLanguage: "fa",
  loaderOptions: {
    path: join(__dirname, "../i18n/"),
    watch: true,
  },
  disableMiddleware: true,
  resolvers: [
    UserLanguageResolver,
    { use: QueryResolver, options: ["lang"] },
    AcceptLanguageResolver,
  ],
};
