import { Field, InputType, Int } from "@nestjs/graphql";
import {
    IsInt,
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;
    
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

  @Field(() => Int, {
    description: "First Banner with sort 0 is considered primary.",
    nullable:true
  })
  @IsOptional()
  @IsInt()
  sort?: number;
}
