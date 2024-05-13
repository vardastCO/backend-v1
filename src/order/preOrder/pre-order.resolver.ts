import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PreOrderService } from './pre-order.service';
import { User } from 'src/users/user/entities/user.entity';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { CreatePreOrderInput } from './dto/create-pre-order.input';
import { PreOrderDTO } from './dto/preOrderDTO';
import { Permission } from 'src/users/authorization/permission.decorator';



@Resolver(() => Boolean)
export class PreOrderResolver {
  constructor(private readonly preOrderService : PreOrderService) {}

  @Permission("gql.users.user.update")
  @Mutation(() => PreOrderDTO)
  createPreOrder(
    @Args("createPreOrderInput") createPreOrderInput: CreatePreOrderInput,
    @CurrentUser() user: User
  ) {
  
    return this.preOrderService.createPreOrder(createPreOrderInput,user);
  }

  
  @Permission("gql.users.user.update")
  @Mutation(() => PreOrderDTO)
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
