import { Field, InputType } from "@nestjs/graphql";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexRoleInput extends IndexInput {
  @Field({ nullable: true })
  isActive?: boolean;
}
