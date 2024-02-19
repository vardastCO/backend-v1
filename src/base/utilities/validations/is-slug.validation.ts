import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { I18n, I18nService } from "nestjs-i18n";

@ValidatorConstraint({ name: "IsSlug", async: false })
export class IsSlug implements ValidatorConstraintInterface {
  constructor(@I18n() protected readonly i18n: I18nService) {}
  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(value));
  }

  defaultMessage(args: ValidationArguments): string {
    return this.i18n.t("validation.IS_SLUG", {
      args: {
        property: this.i18n.t(`common.${args.property}`),
      },
    });
  }
}
