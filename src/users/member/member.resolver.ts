import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
// import { CreateSellerRepresentativeInput } from "./dto/create-seller-representative.input";
// import { IndexSellerRepresentativeInput } from "./dto/index-seller-representative.input";
// import { PaginationSellerRepresentativeResponse } from "./dto/pagination-seller-representative.response";
// import { UpdateSellerRepresentativeInput } from "./dto/update-seller-representative.input";
// import { SellerRepresentative } from "./entities/seller-representative.entity";
// import { RepresentativeService } from "./representative.service";
// import { Seller } from "./entities/seller.entity";
// import { SearchSellerRepresentativeInput } from "./dto/search-seller-representative.input";
import { CreateMemberInput } from "./dto/create-member.input";
import { UpdateMemberInput } from "./dto/update-member.input";
import { Member } from "./entities/members.entity";
import { MemberService } from "./member.service";

@Resolver(() => Member)
export class MemberResolver {
  constructor(
    private readonly memberService: MemberService,
  ) {}


  @Permission("gql.products.seller_representative.store")
  @Mutation(() => Boolean)
  createMember(
    @Args("createMemberInput")
    createMemberInput: CreateMemberInput,
    @CurrentUser() user: User,
  ) {
    return this.memberService.create(
      createMemberInput,
      user,
    );
  }

  
  // @Public()
  // @Permission("gql.products.seller_representative.index")
  // @Query(() => PaginationSellerRepresentativeResponse, {
  //   name: "sellerRepresentatives",
  // })
  // findAll(
  //   @CurrentUser() user: User,
  //   @Args(
  //     "indexSellerRepresentativeInput",
  //     { nullable: true },
  //     new ValidationPipe({ transform: true }),
  //   )
  //   indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  // ) {
  //   return this.memberService.paginate(
  //     user,
  //     indexSellerRepresentativeInput,
  //   );
  // }

  @Permission("gql.products.seller_representative.show")
  @Query(() => Member, { name: "findOneMember" })
  findOneMember(@Args("id", { type: () => Int, nullable: true }) id: number) {
    return this.memberService.findOne(id);
  }

  @Permission("gql.products.seller_representative.update")
  @Mutation(() => Member)
  updateMember(
    @Args("updateMemberInput")
    updateMemberInput: UpdateMemberInput,
    @CurrentUser() user: User,
  ) {
    return this.memberService.update(
      updateMemberInput.id,
      updateMemberInput,
      user,
    );
  }

  @Permission("gql.products.seller_representative.destroy")
  @Mutation(() => Boolean)
  removeMember(@Args("id", { type: () => Int }) id: number) {
    return this.memberService.remove(id);
  }
}
