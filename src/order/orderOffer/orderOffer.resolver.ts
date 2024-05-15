import { Resolver } from '@nestjs/graphql';
import { OrderOfferService } from './orderOffer.service';

import {  Mutation,Args } from '@nestjs/graphql';
import { Permission } from 'src/users/authorization/permission.decorator';
import { OfferOrder } from './entities/order-offer.entity';
import { CreateOrderOfferInput } from './dto/create-order-offer.input';
import { User } from 'src/users/user/entities/user.entity';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';



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

}
