import { Field, ObjectType } from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";

@ObjectType()
export class SuggestResponse {
  @Field(() => [Product], { nullable: "items" })
  products: Product[];

  @Field(() => [Category], { nullable: "items" })
  categories: Category[];
  
  @Field(() => [Seller], { nullable: "items" })
  seller: Seller[];

  @Field(() => [Brand], { nullable: "items" })
  brand: Brand[];

  @Field({ nullable: true })
  SKU?: string;
}
