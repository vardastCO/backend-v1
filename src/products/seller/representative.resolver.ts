import { ValidationPipe } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { CreateSellerRepresentativeInput } from "./dto/create-seller-representative.input";
import { IndexSellerRepresentativeInput } from "./dto/index-seller-representative.input";
import { PaginationSellerRepresentativeResponse } from "./dto/pagination-seller-representative.response";
import { UpdateSellerRepresentativeInput } from "./dto/update-seller-representative.input";
import { SellerRepresentative } from "./entities/seller-representative.entity";
import { RepresentativeService } from "./representative.service";
import { Seller } from "./entities/seller.entity";
import { SearchSellerRepresentativeInput } from "./dto/search-seller-representative.input";

@Resolver(() => SellerRepresentative)
export class RepresentativeResolver {
  constructor(
    private readonly sellerRepresentativeService: RepresentativeService,
  ) {}

  @Permission("gql.products.seller_representative.store")
  @Mutation(() => SellerRepresentative)
  createSellerRepresentative(
    @Args("createSellerRepresentativeInput")
    createSellerRepresentativeInput: CreateSellerRepresentativeInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerRepresentativeService.create(
      createSellerRepresentativeInput,
      user,
    );
  }

  @Public()
  @Permission("gql.products.seller_representative.index")
  @Query(() => [SellerRepresentative], {
    name: "sellerRepresentativesWithoutPagination",
  })
  findAllWithoutPagination(
    @CurrentUser() user: User,
    @Args(
      "indexSellerRepresentativeInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  ) {
    return this.sellerRepresentativeService.findAll(
      user,
      indexSellerRepresentativeInput,
    );
  }

  @Public()
  @Permission("gql.products.seller_representative.index")
  @Query(() => PaginationSellerRepresentativeResponse, {
    name: "sellerRepresentatives",
  })
  findAll(
    @CurrentUser() user: User,
    @Args(
      "indexSellerRepresentativeInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  ) {
    return this.sellerRepresentativeService.paginate(
      user,
      indexSellerRepresentativeInput,
    );
  }

  @Public()
  @Permission("gql.products.seller_representative.show")
  @Query(() => SellerRepresentative, { name: "sellerRepresentative" })
  findOne(@Args("id", { type: () => Int, nullable: true }) id: number) {
    return this.sellerRepresentativeService.findOne(id);
  }
  @Permission("gql.products.product.index")
  @Query(() => Seller, { name: "myProfileSeller" })
  myProfileSeller(
    @Args("searchSellerRepresentativeInput")
    searchSellerRepresentativeInput: SearchSellerRepresentativeInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerRepresentativeService.myProfileSeller(
      user.id,searchSellerRepresentativeInput.name,searchSellerRepresentativeInput
    );
  }
  @Permission("gql.products.seller_representative.update")
  @Mutation(() => SellerRepresentative)
  updateSellerRepresentative(
    @Args("updateSellerRepresentativeInput")
    updateSellerRepresentativeInput: UpdateSellerRepresentativeInput,
    @CurrentUser() user: User,
  ) {
    return this.sellerRepresentativeService.update(
      updateSellerRepresentativeInput.id,
      updateSellerRepresentativeInput,
      user,
    );
  }

  @Permission("gql.products.seller_representative.destroy")
  @Mutation(() => SellerRepresentative)
  removeSellerRepresentative(@Args("id", { type: () => Int }) id: number) {
    return this.sellerRepresentativeService.remove(id);
  }
}
