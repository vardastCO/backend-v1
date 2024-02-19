import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexBrandInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasLogoFile?: boolean ;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasBannerFile?: boolean ;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasCatalogeFile?: boolean ;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  hasPriceList?: boolean ;
  
}
