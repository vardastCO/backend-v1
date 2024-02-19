import { ExecutionContext, Injectable } from "@nestjs/common";
import { I18nResolver } from "nestjs-i18n";

@Injectable()
export class UserLanguageResolver implements I18nResolver {
  async resolve(
    context: ExecutionContext,
  ): Promise<string | string[] | undefined> {
    let req: any;
    let lang = undefined;
    switch (context.getType() as string) {
      case "graphql":
        [, , { req }] = context.getArgs();
        lang = req?.user?.language;
        break;
    }
    return lang;
  }
}
