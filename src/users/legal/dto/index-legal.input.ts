import { Field, InputType, Int } from "@nestjs/graphql";
import { IsOptional, IsDateString ,IsString,IsEnum} from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";


@InputType()
export class IndexLegalInput extends IndexInput {


  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: Date;

}
