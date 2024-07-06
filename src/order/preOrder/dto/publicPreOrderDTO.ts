import { Field, Int, ObjectType } from "@nestjs/graphql";
import { PreOrderDTO } from "./preOrderDTO";


@ObjectType()
export class PublicPreOrderDTO {
  @Field()
  categoryName: string;

  @Field(type => [PreOrderDTO])
  orders: PreOrderDTO[];

  @Field(() => Int)
  categoryId: number;
}

