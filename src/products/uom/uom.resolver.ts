import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Permission } from "src/users/authorization/permission.decorator";
import { Attribute } from "../attribute/entities/attribute.entity";
import { Product } from "../product/entities/product.entity";
import { CreateUomInput } from "./dto/create-uom.input";
import { IndexUomInput } from "./dto/index-uom.input";
import { PaginationUomResponse } from "./dto/pagination-uom.response";
import { UpdateUomInput } from "./dto/update-uom.input";
import { Uom } from "./entities/uom.entity";
import { UomService } from "./uom.service";
import { Public } from "src/users/auth/decorators/public.decorator";

@Resolver(() => Uom)
export class UomResolver {
  constructor(private readonly uomService: UomService) {}

  @Permission("gql.products.uom.store")
  @Mutation(() => Uom)
  createUom(@Args("createUomInput") createUomInput: CreateUomInput) {
    return this.uomService.create(createUomInput);
  }


  @Public()
  // @Permission("gql.products.uom.index")
  @Query(() => [Uom], { name: "uomsWithoutPagination" })
  findAllWithoutPagination(
    @Args(
      "indexUomInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexUomInput?: IndexUomInput,
  ) {
    return this.uomService.findAll(indexUomInput);
  }

  @Permission("gql.products.uom.index")
  @Query(() => PaginationUomResponse, { name: "uoms" })
  findAll(
    @Args(
      "indexUomInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexUomInput?: IndexUomInput,
  ) {
    return this.uomService.paginate(indexUomInput);
  }

  @Permission("gql.products.uom.show")
  @Query(() => Uom, { name: "uom" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.uomService.findOne(id);
  }

  @Permission("gql.products.uom.update")
  @Mutation(() => Uom)
  updateUom(@Args("updateUomInput") updateUomInput: UpdateUomInput) {
    return this.uomService.update(updateUomInput.id, updateUomInput);
  }

  @Permission("gql.products.uom.destroy")
  @Mutation(() => Uom)
  removeUom(@Args("id", { type: () => Int }) id: number) {
    return this.uomService.remove(id);
  }

  @ResolveField(() => [Product])
  products(@Parent() uom: Uom): Promise<Product[]> {
    return this.uomService.getProductsOf(uom);
  }

  @ResolveField(() => [Attribute])
  attributes(@Parent() uom: Uom): Promise<Attribute[]> {
    return this.uomService.getAttributesOf(uom);
  }
}
