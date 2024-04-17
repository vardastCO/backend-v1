import { Field, ObjectType } from "@nestjs/graphql";
import { File } from "../entities/file.entity";

@ObjectType()
export class BannerResponse {
    @Field(() => [File])
    small: File[];
  
    @Field(() => [File])
    medium: File[];
  
    @Field(() => [File])
    large: File[];
  
    @Field(() => [File])
    xlarge: File[];
  
}
