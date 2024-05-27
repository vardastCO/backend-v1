import { ValidationPipe } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
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
import { Req } from '@nestjs/common';
import { Request } from 'express';

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
    @Req() request?: Request
  ) {
    const referer = request.headers.referer || request.headers.origin;
    console.log('fff',referer)
    if (referer) {
      if (referer.includes("seller.vardast.com")) {
        console.log("Request from seller.vardast.com");
      } else if (referer.includes("admin.vardast.com")) {
        console.log("Request from admin.vardast.com");
      } else {
        console.log("Request from an unknown source");
      }
    }
    return this.preOrderService.paginate(currentUser, indexPreOrderInput);
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
