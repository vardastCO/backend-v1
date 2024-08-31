import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  Validate,
} from "class-validator";
import { Permission } from "../../permission/entities/permission.entity";
import { IsUnique } from "../../../../base/utilities/validations/is-unique.validation";
import { Country } from "../../../../base/location/country/entities/country.entity";
import { Role } from "../entities/role.entity";
import { PermissionClaimEnum } from "../../permission/enums/permission-claim.enum";

@InputType()
export class CreateRoleInput {
  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Validate(IsUnique, [Role])
  name: string;

  @Field()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  displayName: string;

  @Field({ nullable: true })
  @IsOptional()
  description: string;

  @Field({ defaultValue: true })
  @IsNotEmpty()
  isActive: boolean;

  @Field(() => [Int], { nullable: "items" })
  @IsNotEmpty()
  permissionIds: number[] | null;

  permissions: Permission[] | null;

  @Field(() => [Int], { nullable: "items" })
  @IsNotEmpty()
  claims: PermissionClaimEnum[] | null;
}
