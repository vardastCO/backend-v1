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
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { CityService } from "../city/city.service";
import { City } from "../city/entities/city.entity";
import { CreateProvinceInput } from "./dto/create-province.input";
import { IndexProvinceInput } from "./dto/index-province.input";
import { PaginationProvinceResponse } from "./dto/pagination-province.response";
import { UpdateProvinceInput } from "./dto/update-province.input";
import { Province } from "./entities/province.entity";
import { ProvinceService } from "./province.service";

@Resolver(() => Province)
export class ProvinceResolver {
  constructor(
    private readonly provinceService: ProvinceService,
    private readonly cityService: CityService,
  ) {}

  @Permission("gql.base.location.province.store")
  @Mutation(() => Province)
  createProvince(
    @Args("createProvinceInput") createProvinceInput: CreateProvinceInput,
  ) {
    return this.provinceService.create(createProvinceInput);
  }

  @Public()
  // @Permission("gql.base.location.province.index")
  @Query(() => PaginationProvinceResponse, { name: "provinces" })
  findAll(
    @Args(
      "indexProvinceInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexProvinceInput?: IndexProvinceInput,
  ) {
    return this.provinceService.paginate(indexProvinceInput);
  }

  @Permission("gql.base.location.province.show")
  @Query(() => Province, { name: "province" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.provinceService.findOne(id, slug);
  }

  @Permission("gql.base.location.province.update")
  @Mutation(() => Province)
  updateProvince(
    @Args("updateProvinceInput") updateProvinceInput: UpdateProvinceInput,
  ) {
    return this.provinceService.update(
      updateProvinceInput.id,
      updateProvinceInput,
    );
  }

  @Permission("gql.base.location.province.destroy")
  @Mutation(() => Province)
  removeProvince(@Args("id", { type: () => Int }) id: number) {
    return this.provinceService.remove(id);
  }

  @ResolveField(returns => [City])
  cities(@Parent() province: Province): Promise<City[]> {
    return this.cityService.findAll({ provinceId: province.id });
  }

  @ResolveField(returns => Int)
  async citiesCount(@Parent() province: Province): Promise<number> {
    return this.cityService.count({ provinceId: province.id });
  }
}
