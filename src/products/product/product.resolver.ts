import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, NotFoundException, UseInterceptors, ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Context,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Cache } from "cache-manager";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { Brand } from "../brand/entities/brand.entity";
import { Offer } from "../offer/entities/offer.entity";
import { Price } from "../price/entities/price.entity";
import { Uom } from "../uom/entities/uom.entity";
import { CreateProductInput } from "./dto/create-product.input";
import { IndexProductInputV2 } from "./dto/index-product-v2.input";
import { IndexProductInput } from "./dto/index-product.input";
import { PaginationProductV2Response } from "./dto/pagination-product-v2.response";
import { PaginationProductResponse } from "./dto/pagination-product.response";
import { UpdateProductInput } from "./dto/update-product.input";
import { Product } from "./entities/product.entity";
import { ProductService } from "./product.service";
import { CreateProductSellerInput } from "./dto/create-product-seller.input";
import { SellerRepresentative } from "../seller/entities/seller-representative.entity";
import { Seller } from "../seller/entities/seller.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { IndexOffersPrice } from "./dto/index-price-offers.input";
import { PaginationOfferResponse } from "../offer/dto/pagination-offer.response";

@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly productService: ProductService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Permission("gql.products.product.store")
  @Mutation(() => Product)
  createProduct(
    @Args("createProductInput") createProductInput: CreateProductInput,
    @CurrentUser() user: User,
  ) {
    return this.productService.create(createProductInput, user);
  }

  @Public()
  @Mutation(() => Product)
  async createProductFromSeller(
    @Args("createProductSellerInput") createProductSellerInput: CreateProductSellerInput,
    @CurrentUser() user: User,
  ) {
    try {
    const product = this.productService.createFromSeller(createProductSellerInput, user);

    const offer: Offer = Offer.create<Offer>();


    offer.productId = (await product).id

    const sellerRepresentative = await SellerRepresentative.findOneBy({userId : user.id });
    if (!sellerRepresentative) {
      throw new NotFoundException();
    }
    const seller = Seller.findOneBy({ id: sellerRepresentative.sellerId });
    
    offer.sellerId = (await seller).id
    offer.status = ThreeStateSupervisionStatuses.PENDING
    offer.isAvailable = false
    offer.isPublic = false

    offer.save()

    return product

    } catch (e) {
      console.log(e)
      
    }
    
    
  }

  @Public()
  // @Permission("gql.products.product.index")
  @Query(() => PaginationProductResponse, { name: "products" })
  async findAll(
    @Args(
      "indexProductInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexProductInput?: IndexProductInput,
    @CurrentUser() user?: User,  
    // @Context() context?: { req: Request }
  ) {

    // const request = context?.req;
    // const referer = request.headers['origin'] ?? null;
    // let client = false 
    // if (referer == 'https://client.vardast.ir' || referer == 'https://vardast.com') {
    //   client = true
    // }
    const result = await this.productService.paginate(indexProductInput,user);

    return result;
  }

  @Public()
  // @Permission("gql.products.product.index")
  @Query(() => [Product], { name: "productsWithoutPagination" })
  findAllWithoutPagination(
    @Args(
      "indexProductInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexProductInput?: IndexProductInput,
  ) {
    return this.productService.findAll(indexProductInput);
  }

  @Public()
  // @Permission("gql.products.product.show")
  @Query(() => Product, { name: "product" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.productService.findOne(id);
  }

  @Public()
  @UseInterceptors()
  @Query(() => PaginationProductV2Response, { name: "productsV2" })
  async findAllV2(
    @Args(
      "indexProductInputV2",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexProductInputV2?: IndexProductInputV2,
  ) {
    // const cacheKey = "products_v2_" + JSON.stringify(indexProductInputV2);

    // const cachedResult = await this.cacheManager.get(cacheKey);

    // if (cachedResult) {
    //   return cachedResult;
    // }

    try {
      const result = await this.productService.paginateV2(indexProductInputV2);

      // await this.cacheManager.set(cacheKey, result, CacheTTL.ONE_WEEK);

      return result;
    } catch (error) {
      // Log the error or handle it appropriately
      throw new Error("Unable to retrieve products. Please try again later.");
    }
  }

  @Public()
  // @Permission("gql.products.product.show")
  @Query(() => Int, { name: "countViewProduct" })
  CountOne(@Args("id", { type: () => Int }) id: number) {
    return this.productService.getProductViewCount(id);
  }

  @Public()
  @Query(() => PaginationOfferResponse, { name: "offersPrice" })
  OffersPrice(
    @Args(
      "indexOffersPrice",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexOffersPrice?: IndexOffersPrice,
 ) {
    return this.productService.getOffersPrice(indexOffersPrice);
  }

  @Permission("gql.products.product.update")
  @Mutation(() => Product)
  updateProduct(
    @Args("updateProductInput") updateProductInput: UpdateProductInput,
  ) {
    return this.productService.update(
      updateProductInput.id,
      updateProductInput,
    );
  }

  @Permission("gql.products.product.destroy")
  @Mutation(() => Product)
  removeProduct(@Args("id", { type: () => Int }) id: number) {
    return this.productService.remove(id);
  }

  @ResolveField(() => Brand)
  brand(@Parent() product: Product): Promise<Brand> {
    return this.productService.getBrandOf(product);
  }

  @ResolveField(() => Category)
  category(@Parent() product: Product): Promise<Category> {
    return this.productService.getCategoryOf(product);
  }

  @ResolveField(() => Uom)
  uom(@Parent() product: Product): Promise<Uom> {
    return this.productService.getUomOf(product);
  }

  @ResolveField(() => [Price])
  prices(@Parent() product: Product): Promise<Price[]> {
    return this.productService.getPricesOf(product);
  }

  @ResolveField(() => [AttributeValue])
  attributeValues(@Parent() product: Product): Promise<AttributeValue[]> {
    return this.productService.getAttributeValuesOf(product);
  }

  @ResolveField(() => User)
  createdBy(@Parent() product: Product): Promise<User> {
    return this.productService.getCreatedByOf(product);
  }

  @ResolveField(() => [Offer])
  offers(
    @Parent() product: Product,
    @CurrentUser() user: User,
  ): Promise<Offer[]> {
    return this.productService.getOffersOf(product, user);
  }

  @ResolveField(() => [Offer])
  publicOffers(@Parent() product: Product): Promise<Offer[]> {
    return this.productService.getPublicOffersOf(product);
  }

  

  @ResolveField(() => Price)
  lowestPrice(@Parent() product: Product) {
    return this.productService.getLowestPriceOf(product);
  }

  @ResolveField(() => Price, { nullable: true })
  myPrice(@Parent() product: Product,
    @Context() context: any,
  ): Promise<Price| null> {
    const user = context?.req?.user?.id
   
    return this.productService.getMyPriceOf(product,user);
  }

  @ResolveField(() => [Product])
  sameCategory(@Parent() product: Product): Promise<Product[]> {
    return this.productService.getSameCategory(product);
  } 


  // @Public()
  // // @Permission("gql.products.product.index")
  // @Query(() => [Product], { name: "sameCategory2" })
  // sameCategory2(@Args("productCategoryId", { type: () => Int }) productCategoryId: number): Promise<Product[]> {
  //   return this.productService.getSameCategoryV2(productCategoryId);
  // }


  
  @ResolveField(() => Price)
  highestPrice(@Parent() product: Product) {
    return null
    return this.productService.getHighestPriceOf(product);
  }
}
