// favorite.resolver.ts
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { User } from "../user/entities/user.entity";
import { FavoriteResponse } from "./dto/favorite.response";
import { UpdateFavoriteInput } from "./dto/favorite.update.input";
import { Favorite } from "./entities/favorite.entity";
import { FavoriteService } from "./favorite.service";
import { EntityTypeInput } from "./dto/favorites.input";
import { ValidationPipe } from "@nestjs/common";
import { Product } from "src/products/product/entities/product.entity";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { EntityTypeEnum } from "./enums/entity-type.enum";
@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Query(() => FavoriteResponse, { name: "favorites" })
  async favorites(
    @Args(
      "favoritesInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    favoritesInput: EntityTypeInput,
    @CurrentUser() currentUser: User,
  ): Promise<FavoriteResponse> {
    const data : Product[] | Brand[] | Seller[] = await this.favoriteService.findFavorites(
      favoritesInput.type,
      currentUser,
    );
    let responseData: { [key: string]: Product[] | Brand[] | Seller[] } = {};

    // Set the property name based on favoritesInput.type
    if (favoritesInput.type === EntityTypeEnum.PRODUCT) {
      responseData = { product: data };
    } else if (favoritesInput.type === EntityTypeEnum.SELLER) {
      responseData = { seller: data };
    } else if (favoritesInput.type === EntityTypeEnum.BRAND) {
      responseData = { brand: data };
    }
  
    return responseData as FavoriteResponse;
  }

  @Query(() => Boolean, { name: "isFavorite" })
  async isFavorite(
    @Args("updateFavoriteInput") updateFavoriteInput: UpdateFavoriteInput,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    return this.favoriteService.isFavorite(
      currentUser.id,
      updateFavoriteInput.entityId,
      updateFavoriteInput.type,
    );
  }

  @Mutation(() => Boolean, { name: "updateFavorite" })
  async updateFavorite(
    @Args(
      "updateFavoriteInput",
      { nullable: true },
      new ValidationPipe({ transform: true }),
    )
    updateFavoriteInput: UpdateFavoriteInput,
    @CurrentUser() currentUser: User,
  ): Promise<boolean> {
    try {
      return await this.favoriteService.updateFavorite(
        currentUser,
        updateFavoriteInput.entityId,
        updateFavoriteInput.type,
      );
    } catch (e) {
      console.log('',e)
    }
    
  }
}
