import { Resolver } from '@nestjs/graphql';
import { OrderOfferService } from './orderOffer.service';

import { Args, Mutation ,Query} from '@nestjs/graphql';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { Permission } from 'src/users/authorization/permission.decorator';
import { User } from 'src/users/user/entities/user.entity';
import { CreateLineOfferInput } from './dto/create-line-offer.input';
import { CreateOrderOfferInput } from './dto/create-order-offer.input';
import { OfferOrder } from './entities/order-offer.entity';
import { PriceOfferDTO } from './dto/priceOfferDTO';
import { AddSellerOrderOffer } from './dto/add-seller-offer.input';
import { TypeOrderOffer } from '../enums/type-order-offer.enum';
import { ThreeStateSupervisionStatuses } from '../enums/three-state-supervision-statuses.enum';
import { UpdateOrderOfferInput } from './dto/update-order-offer.input';

interface PriceOfferDto {
  fi_price: string;
  tax_price: string;
  total_price: string;
}

@Resolver(() => Boolean)
export class OrderOfferResolver {
  constructor(private readonly orderOfferService : OrderOfferService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => OfferOrder)
  createOrderOffer(
    @Args("createOrderOfferInput") createOrderOfferInput: CreateOrderOfferInput,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.createOffer(createOrderOfferInput,user);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => OfferOrder)
  updateOrderOffer(
    @Args("updateOrderOfferInput") updateOrderOfferInput: UpdateOrderOfferInput,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.updateOrderOffer(updateOrderOfferInput);
  }
  @Permission("gql.users.address.store")
  @Mutation(() => OfferOrder)
  addSellerOrderOffer(
    @Args("addSellerOrderOffer") addSellerOrderOffer: AddSellerOrderOffer,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.addSellerOrderOffer(addSellerOrderOffer,user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => OfferOrder)
  createOrderOfferLine(
    @Args("createLineOfferInput") createLineOfferInput: CreateLineOfferInput,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.createOrderOfferLine(createLineOfferInput,user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => PriceOfferDTO )
  calculatePriceOfferLine(
    @Args("lineId") lineId: number,
    @Args("fi_price") fi_price: string,
    @Args({ name: "with_tax", type: () => Boolean, defaultValue: true }) with_tax: boolean,
    @CurrentUser() user: User
  ) {
    return this.orderOfferService.calculatePriceOfferLine(lineId,fi_price,with_tax);
  }

  @Permission("gql.users.address.store")
  @Query(() => OfferOrder, { name: "findOfferPreOrderById" })
  findOfferPreOrderById(
    @Args("id") id: number
  ) {
  
    return this.orderOfferService.getOffer(id)
  }

  @Permission("gql.users.address.store")
  @Mutation(() => OfferOrder)
  removeOfferPreOrderLine(
    @Args("id") id: number
  ) {
  
    return this.orderOfferService.removeOrderOfferLine(id)
  }

}
