import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Context,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { ReferrersEnum } from "src/referrers.enum";
import { Address } from "src/users/address/entities/address.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { ContactInfo } from "src/users/contact-info/entities/contact-info.entity";
import { User } from "src/users/user/entities/user.entity";
import { PaginationBrandResponse } from "../brand/dto/pagination-brand.response";
import { BecomeASellerInput } from "./dto/become-a-seller.input";
import { CreateSellerInput } from "./dto/create-seller.input";
import { IndexSellerBrandInput } from "./dto/index-seller-brand.input";
import { IndexSellerInput } from "./dto/index-seller.input";
import { PaginationSellerResponse } from "./dto/pagination-seller.response";
import { UpdateSellerInput } from "./dto/update-seller.input";
import { Seller } from "./entities/seller.entity";
import { SellerService } from "./seller.service";

@Resolver(() => Seller)
export class SellerResolver {
  constructor(private readonly sellerService: SellerService) {}

  @Permission("gql.products.seller.store")
  @Mutation(() => Seller)
  createSeller(
    @Args("createSellerInput") createSellerInput: CreateSellerInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.create(createSellerInput, user);
  }

  @Mutation(() => Seller)
  countSellerProduct(@CurrentUser() user: User) {
    return;
  }

  @Public()
  // @Permission("gql.products.seller.index")
  @Query(() => [Seller], { name: "sellersWithoutPagination" })
  findAllWithoutPagination(
    @CurrentUser() user: User,
    @Args(
      "indexSellerInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexSellerInput?: IndexSellerInput,
  ) {
    return this.sellerService.findAll(user, indexSellerInput);
  }

  @Public()
  // @Permission("gql.products.seller.index")
  @Query(() => PaginationSellerResponse, { name: "sellers" })
  findAll(
    @CurrentUser() user: User,
    @Args(
      "indexSellerInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexSellerInput?: IndexSellerInput,
    @Context() context?: { req: Request },
  ) {
    const request = context?.req;
    const referer = request.headers["origin"] ?? null;
    const client = [
      ReferrersEnum.CLIENT_VARDAST_IR,
      ReferrersEnum.VARDAST_COM,
    ].includes(referer);

    return this.sellerService.paginate(user, indexSellerInput, client);
  }

  @Public()
  // @Permission("gql.products.seller.show")
  @Query(() => Seller, { name: "seller" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Context() context?: { req: Request },
  ) {
    return this.sellerService.findOne(id);
  }

  @Permission("gql.products.seller.update")
  @Mutation(() => Seller)
  updateSeller(
    @Args("updateSellerInput") updateSellerInput: UpdateSellerInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.update(
      updateSellerInput.id,
      updateSellerInput,
      user,
    );
  }

  @Permission("gql.products.seller.destroy")
  @Mutation(() => Seller)
  removeSeller(@Args("id", { type: () => Int }) id: number) {
    return this.sellerService.remove(id);
  }

  @ResolveField(() => [ContactInfo])
  contacts(@Parent() seller: Seller): Promise<ContactInfo[]> {
    return this.sellerService.getContactInfosOf(seller);
  }

  @ResolveField(() => [Address])
  addresses(@Parent() seller: Seller): Promise<Address[]> {
    return this.sellerService.getAddressesOf(seller);
  }
  @Public()
  @Query(() => PaginationBrandResponse, { name: "brandsOfSeller" })
  brandsOfSeller(
    @Args(
      "indexSellerBrandInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexSellerBrandInput?: IndexSellerBrandInput,
  ): Promise<PaginationBrandResponse> {
    return this.sellerService.getBrandsOfSeller(indexSellerBrandInput);
  }

  @Public()
  @Query(() => Int, { name: "countViewSeller" })
  CountOne(@Args("id", { type: () => Int }) id: number) {
    return this.sellerService.getSellerViewCount(id);
  }

  /**
   * User Level Access
   */
  @Permission("gql.products.seller.moderated_create")
  @Mutation(() => Seller)
  becomeASeller(
    @Args("becomeASellerInput") becomeASellerInput: BecomeASellerInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerService.becomeASeller(becomeASellerInput, user);
  }
}
