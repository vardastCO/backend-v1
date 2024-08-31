import { InputType } from "@nestjs/graphql";
import { IndexInput } from "src/base/utilities/dto/index.input";
import { IsInt, IsOptional } from "class-validator";
import { Field, Int } from "@nestjs/graphql";
@InputType()
export class IndexBlogInput extends IndexInput {
  @Field(() => Int, {
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  categoryId?: number;
}
