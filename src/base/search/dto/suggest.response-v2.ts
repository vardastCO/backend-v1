import { Field, ObjectType } from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { ProductEntity } from "src/products/product/entities/product-service.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";

@ObjectType()
export class SuggestResponseV2 {
  @Field(() => [ProductEntity], { nullable: "items" })
  products: ProductEntity[];


}
