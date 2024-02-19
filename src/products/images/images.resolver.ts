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
import { CreateImageInput } from "./dto/create-image.input";
import { IndexImageInput } from "./dto/index-image.input";
import { PaginationImageResponse } from "./dto/pagination-images.response";
import { UpdateImageInput } from "./dto/update-image.input";
import { Image } from "./entities/image.entity";
import { ImagesService } from "./images.service";

@Resolver(() => Image)
export class ImagesResolver {
  constructor(private readonly imagesService: ImagesService) {}

  @Permission("gql.products.image.store")
  @Mutation(() => Image)
  createImage(
    @Args("createImageInput") createImageInput: CreateImageInput,
    @CurrentUser() user: User,
  ) {
    return this.imagesService.create(createImageInput, user);
  }

  @Permission("gql.products.image.index")
  @Query(() => PaginationImageResponse, { name: "images" })
  findAll(
    @Args(
      "indexImageInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    indexImageInput?: IndexImageInput,
  ) {
    return this.imagesService.paginate(indexImageInput);
  }

  @Permission("gql.products.image.show")
  @Query(() => Image, { name: "image" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.imagesService.findOne(id);
  }

  @Permission("gql.products.image.update")
  @Mutation(() => Image)
  updateImage(@Args("updateImageInput") updateImageInput: UpdateImageInput) {
    return this.imagesService.update(updateImageInput.id, updateImageInput);
  }

  @Permission("gql.products.image.destroy")
  @Mutation(() => Image)
  removeImage(@Args("id", { type: () => Int }) id: number) {
    return this.imagesService.remove(id);
  }

  @ResolveField(() => Product)
  product(@Parent() image: Image): Promise<Product> {
    return this.imagesService.getProductOf(image);
  }
}
