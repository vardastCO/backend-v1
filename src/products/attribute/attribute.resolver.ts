import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { Uom } from "../uom/entities/uom.entity";
import { AttributeService } from "./attribute.service";
import { CreateAttributeInput } from "./dto/create-attribute.input";
import { IndexAttributeInput } from "./dto/index-attribute.input";
import { PaginationAttributeResponse } from "./dto/pagination-attribute.response";
import { UpdateAttributeInput } from "./dto/update-attribute.input";
import { Attribute } from "./entities/attribute.entity";

@Resolver(() => Attribute)
export class AttributeResolver {
  constructor(private readonly attributeService: AttributeService) {}

  @Permission("gql.products.attribute.store")
  @Mutation(() => Attribute)
  createAttribute(
    @Args("createAttributeInput") createAttributeInput: CreateAttributeInput,
    @CurrentUser() user: User,
  ) {
    return this.attributeService.create(createAttributeInput, user);
  }

  @Permission("gql.products.attribute.index")
  @Query(() => PaginationAttributeResponse, { name: "attributes" })
  findAll(
    @Args(
      "indexAttributeInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexAttributeInput?: IndexAttributeInput,
  ) {
    return this.attributeService.paginate(indexAttributeInput);
  }

  @Permission("gql.products.attribute.show")
  @Query(() => Attribute, { name: "attribute" })
  findOne(
    @Args("id", { type: () => Int }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.attributeService.findOne(id, slug);
  }

  @Permission("gql.products.attribute.update")
  @Mutation(() => Attribute)
  updateAttribute(
    @Args("updateAttributeInput") updateAttributeInput: UpdateAttributeInput,
  ) {
    return this.attributeService.update(
      updateAttributeInput.id,
      updateAttributeInput,
    );
  }

  @Permission("gql.products.attribute.destroy")
  @Mutation(() => Attribute)
  removeAttribute(@Args("id", { type: () => Int }) id: number) {
    return this.attributeService.remove(id);
  }

  @ResolveField(() => [Category])
  categories(@Parent() attribute: Attribute): Promise<Category[]> {
    return this.attributeService.getCategoriesOf(attribute);
  }

  @ResolveField(() => Uom)
  uom(@Parent() attribute: Attribute): Promise<Uom> {
    return this.attributeService.getUomOf(attribute);
  }

  @ResolveField(() => User)
  createdBy(@Parent() attribute: Attribute): Promise<User> {
    return this.attributeService.getCreatedByOf(attribute);
  }
}
