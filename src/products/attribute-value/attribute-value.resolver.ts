import { ValidationPipe } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Permission } from "src/users/authorization/permission.decorator";
import { AttributeValueService } from "./attribute-value.service";
import { CreateAttributeValueInput } from "./dto/create-attribute-value.input";
import { IndexAttributeValueInput } from "./dto/index-attribute-value.input";
import { PaginationAttributeValueResponse } from "./dto/pagination-attribute-value.response";
import { UpdateAttributeValueInput } from "./dto/update-attribute-value.input";
import { AttributeValue } from "./entities/attribute-value.entity";

@Resolver(() => AttributeValue)
export class AttributeValueResolver {
  constructor(private readonly attributeValueService: AttributeValueService) {}

  @Permission("gql.products.attribute_value.store")
  @Mutation(() => AttributeValue)
  createAttributeValue(
    @Args("createAttributeValueInput")
    createAttributeValueInput: CreateAttributeValueInput,
  ) {
    return this.attributeValueService.create(createAttributeValueInput);
  }

  @Permission("gql.products.attribute_value.index")
  @Query(() => PaginationAttributeValueResponse, { name: "attributeValues" })
  findAll(
    @Args(
      "indexAttributeInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexAttributeValueInput?: IndexAttributeValueInput,
  ) {
    return this.attributeValueService.paginate(indexAttributeValueInput);
  }

  @Permission("gql.products.attribute_value.index")
  @Query(() => [AttributeValue], {
    name: "attributeValuesWithoutPagination",
  })
  findAllWithoutPagination(
    @Args(
      "indexAttributeInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexAttributeValueInput?: IndexAttributeValueInput,
  ) {
    return this.attributeValueService.findAll(indexAttributeValueInput);
  }

  @Permission("gql.products.attribute_value.show")
  @Query(() => AttributeValue, { name: "attributeValue" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.attributeValueService.findOne(id);
  }

  @Permission("gql.products.attribute_value.update")
  @Mutation(() => AttributeValue)
  updateAttributeValue(
    @Args("updateAttributeValueInput")
    updateAttributeValueInput: UpdateAttributeValueInput,
  ) {
    return this.attributeValueService.update(
      updateAttributeValueInput.id,
      updateAttributeValueInput,
    );
  }

  @Permission("gql.products.attribute_value.destroy")
  @Mutation(() => AttributeValue)
  removeAttributeValue(@Args("id", { type: () => Int }) id: number) {
    return this.attributeValueService.remove(id);
  }
}
