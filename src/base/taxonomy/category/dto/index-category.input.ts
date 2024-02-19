import { Field, InputType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsOptional } from "class-validator";
import { IndexInput } from "../../../utilities/dto/index.input";

@InputType()
export class IndexCategoryInput extends IndexInput {
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  onlyRoots?: boolean = false;

  @Field(type => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  parentCategoryId?: number;

  @Field(type => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  vocabularyId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  sellerId?: number;
}
