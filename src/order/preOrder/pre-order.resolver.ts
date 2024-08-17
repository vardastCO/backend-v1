import { ValidationPipe } from "@nestjs/common";
import { Args, Context, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ReferrersEnum } from "src/referrers.enum";
import { IsRealUserType } from "src/users/auth/decorators/current-type.decorator";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { CreatePreOrderInput } from "./dto/create-pre-order.input";
import { IndexPreOrderInput } from "./dto/index-preOrder.input";
import { IndexPublicOrderInput } from "./dto/index-public-order.input";
import { PaginationPreOrderResponse } from "./dto/pagination-preOrder.responde";
import { PaymentResponse } from "./dto/payment.responde";
import { PublicPreOrderDTO } from "./dto/publicPreOrderDTO";
import { UpdatePreOrderInput } from "./dto/update-pre-order.input";
import { PreOrder } from "./entities/pre-order.entity";
import { PreOrderService } from "./pre-order.service";

@Resolver(() => Boolean)
export class PreOrderResolver {
  constructor(private readonly preOrderService: PreOrderService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  createPreOrder(
    @Args("createPreOrderInput") createPreOrderInput: CreatePreOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.preOrderService.createPreOrder(createPreOrderInput, user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  pickUpPreOrder(
    @Args("preOrderId") preOrderId: number,
    @CurrentUser() user: User,
  ) {
    return this.preOrderService.pickUpPreOrder(preOrderId, user);
  }

  @Permission("gql.users.address.store")
  @Query(() => PaginationPreOrderResponse, { name: "myPreOrder" })
  myPreOrder(
    @CurrentUser() user: User,
    @Args(
      "indexPreOrderInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexPreOrderInput?: IndexPreOrderInput,
  ) {
    return this.preOrderService.myPreOrder(indexPreOrderInput, user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  updatePreOrder(
    @Args("updatePreOrderInput") updatePreOrderInput: UpdatePreOrderInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.preOrderService.update(
      updatePreOrderInput.id,
      updatePreOrderInput,
      currentUser,
    );
  }
  @Permission("gql.users.address.store")
  @Query(() => PreOrder, { name: "findPreOrderById" })
  findPreOrderById(
    @Args("id") id: number,
    @CurrentUser() user: User,
    @Context() context?: { req: Request },
  ) {
    const request = context?.req;
    const referer = request.headers["origin"] ?? null;
    const client = [
      ReferrersEnum.CLIENT_VARDAST_IR,
      ReferrersEnum.VARDAST_COM,
    ].includes(referer);

    return this.preOrderService.findPreOrderById(id, user, client);
  }

  @Permission("gql.users.address.store")
  @Query(() => PaginationPreOrderResponse, { name: "preOrders" })
  findAll(
    @CurrentUser() currentUser?: User,
    @IsRealUserType() isRealUserType?: boolean,
    @Args(
      "indexPreOrderInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexPreOrderInput?: IndexPreOrderInput,
    @Context() context?: { req: Request },
  ) {
    const request = context?.req;
    const referer = request.headers["origin"] ?? null;
    const client = [
      ReferrersEnum.CLIENT_VARDAST_IR,
      ReferrersEnum.VARDAST_COM,
    ].includes(referer);
    const seller = [ReferrersEnum.SELLER_COM, ReferrersEnum.SELLER_IR].includes(
      referer,
    );

    return this.preOrderService.paginate(
      currentUser,
      indexPreOrderInput,
      client,
      seller,
      isRealUserType,
    );
  }
  @Public()
  @Query(() => [PublicPreOrderDTO], { name: "publicOrders" })
  publicOrders(
    @Args(
      "indexPublicOrderInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexPublicOrderInput?: IndexPublicOrderInput,
  ) {
    return this.preOrderService.publicOrders(indexPublicOrderInput);
  }
  @Public()
  @Query(() => [PublicPreOrderDTO], { name: "publicOrders" })
  findOnepublicOrder(
    @Args(
      "id",
      { type: () => Int, nullable: true },
      new ValidationPipe({ transform: true }),
    )
    id: number,
  ) {
    return this.preOrderService.findOnepublicOrder(id);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Boolean)
  removePreOrder(
    @Args(
      "id",
      { type: () => Int, nullable: true },
      new ValidationPipe({ transform: true }),
    )
    id: number,
    @CurrentUser() user: User,
  ) {
    return this.preOrderService.removePreOrder(id, user);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => PaymentResponse)
  payment(
    @Args(
      "offerId",
      { type: () => Int, nullable: true },
      new ValidationPipe({ transform: true }),
    )
    offerId: number,
    @CurrentUser() user: User,
  ): Promise<PaymentResponse> {
    return this.preOrderService.payment(offerId, user);
  }
  // @Permission("gql.users.user.update")
  // @Mutation(() => PreOrderDTO)
  // updatePreOrder(
  //   @Args("createPreOrderInput") createPreOrderInput: CreatePreOrderInput,
  //   @CurrentUser() user: User
  // ) {

  //   return this.preOrderService.updatePreOrder(createPreOrderInput,user);
  // }
}
