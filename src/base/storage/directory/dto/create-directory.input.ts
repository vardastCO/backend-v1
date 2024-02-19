import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";
import { IsUnique } from "src/base/utilities/validations/is-unique.validation";
import { Directory } from "../entities/directory.entity";

@InputType()
export class CreateDirectoryInput {
  @Field()
  @IsNotEmpty()
  @Validate(IsUnique, [Directory])
  @IsString()
  @MaxLength(255)
  path: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  relatedModel: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  relatedProperty: string;

  @Field({ nullable: true })
  @IsOptional()
  // TODO: add exists validation
  @IsString()
  @MaxLength(255)
  viewPermissionName: string;

  @Field({ nullable: true })
  @IsOptional()
  // TODO: add exists validation
  @IsString()
  @MaxLength(255)
  uploadPermissionName: string;
}
