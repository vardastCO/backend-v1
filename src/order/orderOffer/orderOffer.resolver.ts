import { Resolver } from '@nestjs/graphql';
import { OrderOfferService } from './orderOffer.service';

import { Args, Mutation } from '@nestjs/graphql';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { Permission } from 'src/users/authorization/permission.decorator';
import { User } from 'src/users/user/entities/user.entity';
import { CreateLineOfferInput } from './dto/create-line-offer.input';
import { CreateOrderOfferInput } from './dto/create-order-offer.input';
import { OfferOrder } from './entities/order-offer.entity';



@Resolver(() => Boolean)
export class OrderOfferResolver {
  constructor(private readonly orderOfferService : OrderOfferService) {}

  @Permission("gql.users.user.update")
  @Mutation(() => OfferOrder)
  createOrderOffer(
    @Args("createOrderOfferInput") createOrderOfferInput: CreateOrderOfferInput,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.createOffer(createOrderOfferInput,user);
  }

  @Permission("gql.users.user.update")
  @Mutation(() => OfferOrder)
  createOrderOfferLine(
    @Args("createLineOfferInput") createLineOfferInput: CreateLineOfferInput,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.createOrderOfferLine(createLineOfferInput,user);
  }

  @Permission("gql.users.user.update")
  @Mutation(() => OfferOrder)
  findOfferPreOrderById(
    @Args("id") id: number
  ) {
  
    return this.orderOfferService.getOffer(id)
  }

}
