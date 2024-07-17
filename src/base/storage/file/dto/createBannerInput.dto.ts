import { Field, InputType } from "@nestjs/graphql";
import {
    IsNotEmpty,
    IsOptional,
    IsString
} from "class-validator";


@InputType()
export class CreateBannerInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  small_uuid: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;
    
  @Field()
  @IsNotEmpty()
  @IsString()
  medium_uuid: string;
   
  @Field()
  @IsNotEmpty()
  @IsString()
  large_uuid: string;
   
  @Field()
  @IsNotEmpty()
  @IsString()
  xlarge_uuid: string;
  

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  link_url?: string;
}
