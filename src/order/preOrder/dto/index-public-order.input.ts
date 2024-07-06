import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";



@InputType()
export class IndexPublicOrderInput extends IndexInput {
  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;


}
