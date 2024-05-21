import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PreOrderLineService } from './pre-order-line.service';
import { CreateLineInput } from './dto/create-pre-order.input';
import { User } from 'src/users/user/entities/user.entity';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { Permission } from 'src/users/authorization/permission.decorator';
import { ValidationPipe } from "@nestjs/common";
import { LineDTO } from './dto/lineDTO';
import { PreOrder } from '../preOrder/entities/pre-order.entity';


@Resolver(() => LineDTO)
export class PreOrderLineResolver {
  constructor(private readonly preOrderLineService : PreOrderLineService) {}

  
  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  createline(
    @Args('createLineInput', { type: () => CreateLineInput, nullable: true }, new ValidationPipe({ transform: true }))
    createLineInput: CreateLineInput,
    @CurrentUser() user: User
  ) {
   
    return this.preOrderLineService.creatline(createLineInput,user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => Boolean)
  removeline(
    @Args('id', { type: () => Int, nullable: true }, new ValidationPipe({ transform: true }))
    id: number,
    @CurrentUser() user: User
  ) {
   
    return this.preOrderLineService.removeline(id,user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => LineDTO)
  addTempProduct(
    @Args('addTempProduct', { type: () => CreateLineInput, nullable: true }, new ValidationPipe({ transform: true }))
    addTempProduct: CreateLineInput,
    @CurrentUser() user: User
  ) {
   
    return this.preOrderLineService.creatline(addTempProduct,user);
  }

}
