import { ValidationPipe } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { Permission } from "src/users/authorization/permission.decorator";
import { AreaService } from "./area.service";
import { CreateAreaInput } from "./dto/create-area.input";
import { IndexAreaInput } from "./dto/index-area.input";
import { PaginationAreaResponse } from "./dto/pagination-area.response";
import { UpdateAreaInput } from "./dto/update-area.input";
import { Area } from "./entities/area.entity";

@Resolver(() => Area)
export class AreaResolver {
  constructor(private readonly areaService: AreaService) {}

  @Permission("gql.base.location.area.store")
  @Mutation(() => Area)
  createArea(@Args("createAreaInput") createAreaInput: CreateAreaInput) {
    return this.areaService.create(createAreaInput);
  }

  @Permission("gql.base.location.area.index")
  @Query(() => PaginationAreaResponse, { name: "areas" })
  findAll(
    @Args(
      "indexAreaInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexAreaInput?: IndexAreaInput,
  ) {
    return this.areaService.paginate(indexAreaInput);
  }

  @Permission("gql.base.location.area.show")
  @Query(() => Area, { name: "area" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.areaService.findOne(id, slug);
  }

  @Permission("gql.base.location.area.update")
  @Mutation(() => Area)
  updateArea(@Args("updateAreaInput") updateAreaInput: UpdateAreaInput) {
    return this.areaService.update(updateAreaInput.id, updateAreaInput);
  }

  @Permission("gql.base.location.area.destroy")
  @Mutation(() => Area)
  removeArea(@Args("id", { type: () => Int }) id: number) {
    return this.areaService.remove(id);
  }
}
