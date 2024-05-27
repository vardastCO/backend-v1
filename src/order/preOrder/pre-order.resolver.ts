import { ValidationPipe } from "@nestjs/common";
import { Args, Mutation, Query, Resolver,Context,Int  } from '@nestjs/graphql';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { Public } from 'src/users/auth/decorators/public.decorator';
import { Permission } from 'src/users/authorization/permission.decorator';
import { User } from 'src/users/user/entities/user.entity';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { IndexPreOrderInput } from './dto/index-preOrder.input';
import { PaginationPreOrderResponse } from './dto/pagination-preOrder.responde';
import { PreOrderDTO } from './dto/preOrderDTO';
import { UpdatePreOrderInput } from './dto/update-pre-order.input';
import { PreOrder } from './entities/pre-order.entity';
import { PreOrderService } from './pre-order.service';


@Resolver(() => Boolean)
export class PreOrderResolver {
  constructor(private readonly preOrderService : PreOrderService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  createPreOrder(
    @Args("createPreOrderInput") createPreOrderInput: CreatePreOrderInput,
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.createPreOrder(createPreOrderInput,user);
  }

  
  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  pickUpPreOrder(
    @Args("preOrderId") preOrderId: number,
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.pickUpPreOrder(preOrderId,user);
  }

  @Permission("gql.users.address.store")
  @Query(() => PaginationPreOrderResponse, { name: "myPreOrder" })
  myPreOrder(
    @CurrentUser() user: User,
    @Args("indexPreOrderInput", { nullable: true },new ValidationPipe({ transform: true }),)
    indexPreOrderInput?: IndexPreOrderInput,
  ) {
  
    return this.preOrderService.myPreOrder(indexPreOrderInput,user);
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
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.findPreOrderById(id,user);
  }



  // @Public()
  @Permission("gql.users.address.store")
  @Query(() => PaginationPreOrderResponse, { name: "preOrders" })
  findAll(
    @CurrentUser() currentUser: User,
    @Args("indexPreOrderInput", { nullable: true },new ValidationPipe({ transform: true }),)
    indexPreOrderInput?: IndexPreOrderInput,
    @Context() context?: { req: Request }
  ) {
    const request = context?.req;
    const referer = request.headers['origin'] ?? null;
    let client = false 
    if (referer == 'https://client.vardast.ir' || referer == 'https://vardast.com') {
      client = true
    }
    return this.preOrderService.paginate(currentUser, indexPreOrderInput,client);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => Boolean)
  removePreOrder(
    @Args('id', { type: () => Int, nullable: true }, new ValidationPipe({ transform: true }))
    id: number,
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.removePreOrder(id,user);
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
