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
import { Price } from "../price/entities/price.entity";
import { Product } from "../product/entities/product.entity";
import { Seller } from "../seller/entities/seller.entity";
import { CreateOfferInput } from "./dto/create-offer.input";
import { IndexOfferInput } from "./dto/index-offer.input";
import { PaginationOfferResponse } from "./dto/pagination-offer.response";
import { UpdateOfferInput } from "./dto/update-offer.input";
import { Offer } from "./entities/offer.entity";
import { OfferService } from "./offer.service";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "src/users/user/entities/user.entity";
import { IndexTakeBrandToSeller } from "./dto/index-brand-seller.input";
import { Public } from "src/users/auth/decorators/public.decorator";
import { PaginationSellerResponse } from "../seller/dto/pagination-seller.response";
@Resolver(() => Offer)
export class OfferResolver {
  constructor(private readonly offerService: OfferService) {}

  @Permission("gql.products.offer.store.mine")
  @Mutation(() => Offer)
  createOffer(
    @Args("createOfferInput") createOfferInput: CreateOfferInput,
    @CurrentUser() user: User,
  ) {
    return this.offerService.create(createOfferInput, user);
  }

  @Permission("gql.products.offer.index.mine")
  @Query(() => PaginationOfferResponse, { name: "offers" })
  findAll(
    @CurrentUser() user: User,
    @Args(
      "indexOfferInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexOfferInput?: IndexOfferInput,
  ) {
    return this.offerService.paginate(user, indexOfferInput);
  }

  @Permission("gql.products.offer.show.mine")
  @Query(() => Offer, { name: "offer" })
  findOne(
    @Args("id", { type: () => Int }) id: number,
    @CurrentUser() user: User,
  ) {
    return this.offerService.findOne(id, user);
  }

  @Public()
  @Query(() => PaginationSellerResponse, { name: "takeBrandToSeller" })
  takeBrandToSeller(
    @Args(
      "indexTakeBrandToSeller",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexTakeBrandToSeller: IndexTakeBrandToSeller,
  ) {
    return this.offerService.takeBrandToSeller(indexTakeBrandToSeller);
  }

  @Permission("gql.products.offer.update.mine")
  @Mutation(() => Offer)
  updateOffer(
    @Args("updateOfferInput") updateOfferInput: UpdateOfferInput,
    @CurrentUser() user: User,
  ) {
    return this.offerService.update(
      updateOfferInput.id,
      updateOfferInput,
      user,
    );
  }

  @Permission("gql.products.offer.destroy")
  @Mutation(() => Boolean)
  removeOffer(@Args("productId", { type: () => Int,nullable: true  }) id: number,
    @Args("offerId", { type: () => Int, nullable: true }) offerId: number | null,
    @CurrentUser() user: User) {
    
    return this.offerService.remove(id,user,offerId);
  }

  @ResolveField(() => Product)
  product(@Parent() offer: Offer): Promise<Product> {
    return this.offerService.getProductOf(offer);
  }

  @ResolveField(() => Seller)
  seller(@Parent() offer: Offer): Promise<Seller> {
    return this.offerService.getSellerOf(offer);
  }

  @ResolveField(() => Price)
  lastPublicConsumerPrice(@Parent() offer: Offer): Promise<Price> {
    return this.offerService.getLastPublicConsumerPriceOf(offer);
  }
}
