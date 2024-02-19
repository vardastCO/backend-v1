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
import { Permission } from "src/users/authorization/permission.decorator";
import { AreaService } from "../area/area.service";
import { Area } from "../area/entities/area.entity";
import { CityService } from "./city.service";
import { CreateCityInput } from "./dto/create-city.input";
import { IndexCityInput } from "./dto/index-city.input";
import { PaginationCityResponse } from "./dto/pagination-city.response";
import { UpdateCityInput } from "./dto/update-city.input";
import { City } from "./entities/city.entity";
import { Public } from "src/users/auth/decorators/public.decorator";

@Resolver(() => City)
export class CityResolver {
  constructor(
    private readonly cityService: CityService,
    private readonly areaService: AreaService,
  ) {}

  @Permission("gql.base.location.city.store")
  @Mutation(() => City)
  createCity(@Args("createCityInput") createCityInput: CreateCityInput) {
    return this.cityService.create(createCityInput);
  }

  @Public()
  // @Permission("gql.base.location.city.index")
  @Query(() => PaginationCityResponse, { name: "cities" })
  findAll(
    @Args(
      "indexCityInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexCityInput?: IndexCityInput,
  ) {
    return this.cityService.paginate(indexCityInput);
  }

  @Permission("gql.base.location.city.show")
  @Query(() => City, { name: "city" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.cityService.findOne(id, slug);
  }

  @Permission("gql.base.location.city.update")
  @Mutation(() => City)
  updateCity(@Args("updateCityInput") updateCityInput: UpdateCityInput) {
    return this.cityService.update(updateCityInput.id, updateCityInput);
  }

  @Permission("gql.base.location.city.destroy")
  @Mutation(() => City)
  removeCity(@Args("id", { type: () => Int }) id: number) {
    return this.cityService.remove(id);
  }

  @ResolveField(returns => [Area])
  areas(@Parent() city: City): Promise<Area[]> {
    return this.areaService.findAll({ cityId: city.id });
  }

  @ResolveField(returns => Int)
  async areasCount(@Parent() city: City): Promise<number> {
    return this.areaService.count({ cityId: city.id });
  }
}
