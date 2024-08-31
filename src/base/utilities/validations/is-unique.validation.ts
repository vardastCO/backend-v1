import { InjectDataSource } from "@nestjs/typeorm";
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { I18n, I18nService } from "nestjs-i18n";
import { DataSource, Not } from "typeorm";

@ValidatorConstraint({ name: "IsUnique", async: false })
export class IsUnique implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @I18n() protected readonly i18n: I18nService,
  ) {}
  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    const modelOrTableName = args.constraints[0];
    const columnName = args.constraints[1] ?? args.property;
    const ignoreValue = args.constraints[2] ?? args.object["id"] ?? null;
    const ignoreColumn = args.constraints[3] ?? "id";

    const queryBuilder =
      typeof modelOrTableName === "string"
        ? this.dataSource.createQueryBuilder().from(modelOrTableName, "Tbl")
        : modelOrTableName.createQueryBuilder();

    if (ignoreValue !== null) {
      queryBuilder.where({
        [columnName]: value,
        [ignoreColumn]: Not(ignoreValue),
      });
    } else {
      queryBuilder.where({ [columnName]: value });
    }

    return !(await queryBuilder.getExists());
  }

  // defaultMessage(args: ValidationArguments): string {
  //   return this.i18n.t("validation.IS_UNIQUE", {
  //     args: {
  //       property: this.i18n.t(`common.${args.property}`),
  //     },
  //   });
  // }

  defaultMessage(args: ValidationArguments) {
    return "این کالا قبلا ثبت شده است";
  }
}
