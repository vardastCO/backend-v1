import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class PriceOfferDTO {
  @Field({ nullable: true })
  fi_price: string;

  @Field({ nullable: true })
  tax_price: string;

  @Field({ nullable: true })
  total_price: string;
}
