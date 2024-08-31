import { Resolver, Query, Args, Int, Mutation } from "@nestjs/graphql";
import { PreFileService } from "./pre-file.service";
import { Permission } from "src/users/authorization/permission.decorator";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "src/users/user/entities/user.entity";
import { AddFilePreOrderInput } from "./dto/add-pre-order-file.input";

import { ValidationPipe } from "@nestjs/common";
import { PreOrder } from "../preOrder/entities/pre-order.entity";

@Resolver(() => Boolean)
export class PreFileResolver {
  constructor(private readonly preFileService: PreFileService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => PreOrder)
  addFilePreOrder(
    @Args(
      "addFilePreOrderInput",
      { type: () => AddFilePreOrderInput, nullable: true },
      new ValidationPipe({ transform: true }),
    )
    addFilePreOrderInput: AddFilePreOrderInput,
    @CurrentUser() user: User,
  ) {
    return this.preFileService.addFilePreOrder(addFilePreOrderInput, user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => Boolean)
  removeFilePreOrder(
    @Args(
      "id",
      { type: () => Int, nullable: true },
      new ValidationPipe({ transform: true }),
    )
    id: number,
    @CurrentUser() user: User,
  ) {
    return this.preFileService.removeFilePreOrder(id, user);
  }
}
