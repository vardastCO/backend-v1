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
import { Province } from "../province/entities/province.entity";
import { ProvinceService } from "../province/province.service";
import { CountryService } from "./country.service";
import { CreateCountryInput } from "./dto/create-country.input";
import { IndexCountryInput } from "./dto/index-country.input";
import { PaginationCountryResponse } from "./dto/pagination-country.response";
import { UpdateCountryInput } from "./dto/update-country.input";
import { Country } from "./entities/country.entity";

@Resolver(() => Country)
export class CountryResolver {
  constructor(
    private readonly countryService: CountryService,
    private readonly provinceService: ProvinceService,
  ) {}

  @Permission("gql.base.location.country.store")
  @Mutation(() => Country)
  createCountry(
    @Args("createCountryInput") createCountryInput: CreateCountryInput,
  ) {
    return this.countryService.create(createCountryInput);
  }

  @Public()
  // @Permission("gql.base.location.country.index")
  @Query(() => [Country], { name: "countriesWithoutPagination" })
  findAllWithoutPagination(
    @Args(
      "indexCountryInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexCountryInput?: IndexCountryInput,
  ) {
    return this.countryService.findAll(indexCountryInput);
  }

  @Public()
  @Permission("gql.base.location.country.index")
  @Query(() => PaginationCountryResponse, { name: "countries" })
  findAll(
    @Args(
      "indexCountryInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexCountryInput?: IndexCountryInput,
  ) {
    return this.countryService.paginate(indexCountryInput);
  }

  @Public()
  // @Permission("gql.base.location.country.show")
  @Query(() => Country, { name: "country" })
  findOne(
    @Args("id", { type: () => Int, nullable: true }) id: number,
    @Args("slug", { type: () => String, nullable: true }) slug: string,
  ) {
    return this.countryService.findOne(id, slug);
  }

  @Permission("gql.base.location.country.update")
  @Mutation(() => Country)
  updateCountry(
    @Args("updateCountryInput") updateCountryInput: UpdateCountryInput,
  ) {
    return this.countryService.update(
      updateCountryInput.id,
      updateCountryInput,
    );
  }

  @Permission("gql.base.location.country.destroy")
  @Mutation(() => Country)
  removeCountry(@Args("id", { type: () => Int }) id: number) {
    return this.countryService.remove(id);
  }

  @ResolveField(type => [Province])
  provinces(@Parent() country: Country): Promise<Province[]> {
    return this.provinceService.findAll({ countryId: country.id });
  }

  @ResolveField(returns => Int)
  async provincesCount(@Parent() country: Country): Promise<number> {
    return this.provinceService.count({ countryId: country.id });
  }
}
