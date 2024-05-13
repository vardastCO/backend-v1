import { Field, Int, ObjectType } from "@nestjs/graphql";
import { LineDTO } from "src/order/line/dto/lineDTO";
import { FileOrderDTO } from "src/order/preFile/dto/fileOrderDTO";

@ObjectType()
export class PreOrderDTO {
  @Field(() => Int)
  id: number;

  @Field(() => Int,{nullable: true})
  projectId?: number;

  @Field(() => String,{nullable: true})
  request_date?: string;

  @Field(() => String,{nullable: true})
  expire_date?: string;


  @Field(() => String,{nullable: true})
  shipping_address?: string;

  @Field(() => String,{nullable: true})
  descriptions?: string;

  @Field(() => [LineDTO], { nullable: true })
  lines: LineDTO[];

  @Field(() => [FileOrderDTO], { nullable: true })
  files: FileOrderDTO[];


}
