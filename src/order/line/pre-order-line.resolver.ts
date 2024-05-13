import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { PreOrderLineService } from './pre-order-line.service';
import { CreateLineInput } from './dto/create-pre-order.input';
import { User } from 'src/users/user/entities/user.entity';
import { CurrentUser } from 'src/users/auth/decorators/current-user.decorator';
import { Permission } from 'src/users/authorization/permission.decorator';
import { ValidationPipe } from "@nestjs/common";
import { LineDTO } from './dto/lineDTO';


@Resolver(() => LineDTO)
export class PreOrderLineResolver {
  constructor(private readonly preOrderLineService : PreOrderLineService) {}

  
  @Permission("gql.users.user.update")
  @Mutation(() => LineDTO)
  createline(
    @Args('createLineInput', { type: () => CreateLineInput, nullable: true }, new ValidationPipe({ transform: true }))
    createLineInput: CreateLineInput,
    @CurrentUser() user: User
  ) {
   
    return this.preOrderLineService.creatline(createLineInput,user);
  }

  @Permission("gql.users.user.update")
  @Mutation(() => LineDTO)
  addTempProduct(
    @Args('addTempProduct', { type: () => CreateLineInput, nullable: true }, new ValidationPipe({ transform: true }))
    addTempProduct: CreateLineInput,
    @CurrentUser() user: User
  ) {
   
    return this.preOrderLineService.creatline(addTempProduct,user);
  }

}
