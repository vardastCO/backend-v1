import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString } from "class-validator";



@InputType()
export class IndexPublicOrderInput  {
  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  number?: number;

}
