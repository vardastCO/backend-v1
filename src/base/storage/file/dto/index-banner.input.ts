import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
import { FileModelTypeEnum } from "../enums/file-model-type.enum";

@InputType()
export class IndexBannerInput {
  @Field(() => FileModelTypeEnum)
  @IsNotEmpty()
  type: FileModelTypeEnum;
}
