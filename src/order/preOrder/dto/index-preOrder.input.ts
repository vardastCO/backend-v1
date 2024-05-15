import { Field, InputType } from "@nestjs/graphql";
import { IsInt, IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";



@InputType()
export class IndexPreOrderInput extends IndexInput {
  @Field({ nullable: true })
  @IsInt()
  @IsOptional()
  projectId?: number;
}
