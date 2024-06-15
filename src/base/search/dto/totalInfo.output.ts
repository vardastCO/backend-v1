import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TotalInfoResponse {
  @Field()
  countOfBrands: number;

  @Field()
  countOfSellers: number;

  @Field()
  countOfUsers: number;

  @Field()
  countOfProducts: number;

  @Field()
  countOfCategories: number;

  @Field()
  countOfOrders: number;

  @Field()
  countOfSellersOnline: number;

  @Field()
  countOfSellersNormal: number;

  @Field()
  countOfSellersOffline: number;

  @Field()
  countOfSellersExtended: number;

  @Field()
  countOfProjects: number;
}
