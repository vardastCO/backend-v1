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
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { Product } from "../product/entities/product.entity";
import { CreatePriceInput } from "./dto/create-price.input";
import { IndexPriceInput } from "./dto/index-price.input";
import { PaginationPriceResponse } from "./dto/pagination-price.response";
import { UpdatePriceInput } from "./dto/update-price.input";
import { Price } from "./entities/price.entity";
import { PriceService } from "./price.service";
import { Public } from "src/users/auth/decorators/public.decorator";
import { ChartOutput } from "./dto/chart-output";
import { ChartInput } from "./dto/chart-input";

@Resolver(() => Price)
export class PriceResolver {
  constructor(private readonly priceService: PriceService) {}

  // @Permission("gql.products.price.store")
  @Mutation(() => Price)
  createPrice(
    @Args("createPriceInput") createPriceInput: CreatePriceInput,
    @CurrentUser() user: User,
  ) {
    return this.priceService.create(createPriceInput, user);
  }

  @Permission("gql.products.price.index")
  @Query(() => PaginationPriceResponse, { name: "prices" })
  findAll(
    @Args(
      "indexPriceInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexPriceInput?: IndexPriceInput,
  ) {
    return this.priceService.paginate(indexPriceInput);
  }

  @Permission("gql.products.price.show")
  @Query(() => Price, { name: "price" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.priceService.findOne(id);
  }

  @Permission("gql.products.price.update")
  @Mutation(() => Price)
  updatePrice(@Args("updatePriceInput") updatePriceInput: UpdatePriceInput) {
    return this.priceService.update(updatePriceInput.id, updatePriceInput);
  }

  @Permission("gql.products.price.destroy")
  @Mutation(() => Price)
  removePrice(@Args("id", { type: () => Int }) id: number) {
    return this.priceService.remove(id);
  }

  @ResolveField(() => Product)
  product(@Parent() price: Price): Promise<Product> {
    return this.priceService.getProductOf(price);
  }

  // @ResolveField(() => Supplier)
  // supplier(@Parent() price: Price): Promise<Supplier> {
  //   return this.priceService.getSupplierOf(price);
  // }

  @ResolveField(() => User)
  createdBy(@Parent() price: Price): Promise<User> {
    return this.priceService.getCreatedByOf(price);
  }

  @Public()
  @Query(() => ChartOutput, { name: "priceChart" })
  priceChart(@Args("chartInput") chartInput: ChartInput) {
    return this.priceService.priceChart(chartInput);
  }

  @Public()
  @Query(() => String, { name: "calculatePrice" })
  calculatePrice(
    @Args("amount") amount: string,
    @Args("valueDiscount") valueDiscount: string,
  ) {
    return Math.floor(
      Number(amount) * ((100 - Number(valueDiscount)) / 100),
    ).toString();
  }
}
