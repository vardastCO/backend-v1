import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";

@ObjectType()
export class FavoriteResponse {
  @Field(() => [Brand], { nullable: "items" })
  brand?: Brand[];

  @Field(() => [Product], { nullable: "items" })
  product?: Product[];

  @Field(() => [Seller], { nullable: "items" })
  seller?: Seller[];

  @Field(() => Int, { nullable: true })
  id?: number; // Making id optional

  @Field(() => String, { nullable: true })
  error?: string; // Adding an error field
}
