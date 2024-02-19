import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, Validate } from "class-validator";
import { IsUnique } from "../../../../base/utilities/validations/is-unique.validation";
import { Country } from "../../../../base/location/country/entities/country.entity";
import { Permission } from "../entities/permission.entity";

@InputType()
export class CreatePermissionInput {
  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Permission])
  displayName: string;
}
