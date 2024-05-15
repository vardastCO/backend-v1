import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PreOrderService } from './pre-order.service';
import { User } from 'src/users/user/entities/user.entity';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { PreOrderDTO } from './dto/preOrderDTO';
import { Permission } from 'src/users/authorization/permission.decorator';
import { PreOrder } from './entities/pre-order.entity';
import { UpdatePreOrderInput } from './dto/update-pre-order.input';



@Resolver(() => Boolean)
export class PreOrderResolver {
  constructor(private readonly preOrderService : PreOrderService) {}

  @Permission("gql.users.user.update")
  @Mutation(() => PreOrder)
  createPreOrder(
    @Args("createPreOrderInput") createPreOrderInput: CreatePreOrderInput,
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.createPreOrder(createPreOrderInput,user);
  }

  @Permission("gql.users.user.update")
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
  @Permission("gql.users.user.update")
  @Mutation(() => PreOrder)
  findPreOrderById(
    @Args("id") id: number,
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.findPreOrderById(id,user);
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
