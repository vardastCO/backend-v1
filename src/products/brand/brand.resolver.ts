import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Context,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Address } from "src/users/address/entities/address.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { User } from "src/users/user/entities/user.entity";
import { Product } from "../product/entities/product.entity";
import { BrandService } from "./brand.service";
import { CreateBrandInput } from "./dto/create-brand.input";
import { IndexBrandInput } from "./dto/index-brand.input";
import { PaginationBrandResponse } from "./dto/pagination-brand.response";
import { UpdateBrandInput } from "./dto/update-brand.input";
import { Brand } from "./entities/brand.entity";
import { PayloadDto } from "./dto/payload-brand";

@Resolver(() => Brand)
export class BrandResolver {
  constructor(private readonly brandService: BrandService) {}

  @Permission("gql.products.brand.store")
  @Mutation(() => Brand)
  createBrand(
    @Args("createBrandInput") createBrandInput: CreateBrandInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.brandService.create(createBrandInput, currentUser);
  }

  @Public()
  // @Permission("gql.products.brand.index")
  @Query(() => [Brand], { name: "brandsWithoutPagination" })
  findAllWithoutPagination(
    @Args(
      "indexBrandInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexBrandInput?: IndexBrandInput,
  ) {
    return this.brandService.findAll(indexBrandInput);
  }

  @Public()
  // @Permission("gql.products.brand.index")
  @Query(() => PaginationBrandResponse, { name: "brands" })
  findAll(
    @Args(
      "indexBrandInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexBrandInput?: IndexBrandInput,
    @CurrentUser() user?: User,
  ) {
    return this.brandService.paginate(indexBrandInput, user);
  }

  @Public()
  // @Permission("gql.products.brand.show")
  @Query(() => Brand, { name: "brand" })
  findOne(@Args("id", { type: () => Int }) id: number): Promise<Brand> {
    return this.brandService.findOne(id);
  }
  @Permission("gql.products.brand.update")
  @Mutation(() => Brand)
  updateBrand(
    @Args("updateBrandInput") updateBrandInput: UpdateBrandInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.brandService.update(
      updateBrandInput.id,
      updateBrandInput,
      currentUser,
    );
  }

  @Permission("gql.products.brand.destroy")
  @Mutation(() => Brand)
  removeBrand(@Args("id", { type: () => Int }) id: number) {
    return this.brandService.remove(id);
  }

  @Permission("gql.products.brand.destroy")
  @Mutation(() => Brand)
  removeBrandFile(
    @Args("fileId", { type: () => Int }) fileId: number,
    @Args("id", { type: () => Int }) id: number,
  ) {
    return this.brandService.removeBrandFile(id, fileId);
  }

  @ResolveField(() => [Product])
  products(@Parent() brand: Brand): Promise<Product[]> {
    return this.brandService.getProductsOf(brand);
  }

  @Public()
  // @Permission("gql.products.product.show")
  @Query(() => Int, { name: "countViewBrand" })
  CountOne(@Args("id", { type: () => Int }) id: number) {
    return this.brandService.getBrandViewCount(id);
  }

  @ResolveField(() => [ContactInfo])
  contacts(@Parent() brand: Brand): Promise<ContactInfo[]> {
    return this.brandService.getContactInfosOf(brand);
  }

  @ResolveField(() => [Address])
  addresses(@Parent() brand: Brand): Promise<Address[]> {
    return this.brandService.getAddressesOf(brand);
  }
}
