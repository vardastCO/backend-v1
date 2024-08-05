import {
  Args,
  Mutation,
  Query,
  Resolver
} from "@nestjs/graphql";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Permission } from "../authorization/permission.decorator";
import { User } from "../user/entities/user.entity";
import { ValidationPipe } from "@nestjs/common";
import { Legal } from "./entities/legal.entity";
import { LegalService } from "./legal.service";
import { CreateLegalInput } from "./dto/create-legal.input";
import { UpdateLegalInput } from "./dto/update-legal.input";
import { PaginationLegalResponse } from "./dto/pagination-legal.response";
import { IndexLegalInput } from "./dto/index-legal.input";
import { CreateUserLegalInput } from "./dto/create-user-legal.input";


@Resolver(() => Legal)
export class LegalResolver {
  constructor(private readonly legalService: LegalService) {}

  @Permission("gql.users.address.store")
  @Mutation(() => Legal)
  createLegal(
    @Args("createLegalInput") createLegalInput: CreateLegalInput,
    @CurrentUser() user: User,
  ) {
    return this.legalService.create(createLegalInput, user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => Legal)
  updateLegal(
    @Args("updateLegalInput") updateLegalInput: UpdateLegalInput,
    @CurrentUser() user: User,
  ) {
    return this.legalService.update(updateLegalInput.id, updateLegalInput, user);
  }

  @Permission("gql.users.address.store")
  @Mutation(() => Boolean)
  deleteLegal(@Args("id") id: number, @CurrentUser() user: User) {
    return this.legalService.remove(id, user.id);
  }
  @Permission("gql.users.address.store")
  @Query(() => PaginationLegalResponse)
  findAllLegals(
    @Args(
      "indexLegalInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexLegalInput?: IndexLegalInput,
  ) {
    return this.legalService.findAll(indexLegalInput);
  }
  @Permission("gql.users.address.store")
  @Query(() => Legal)
  findOneLegal(@Args("id") id: number) {
    return this.legalService.findOne(id);
  }


}
