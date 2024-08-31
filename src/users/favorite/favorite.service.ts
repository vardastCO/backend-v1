// favorite.service.ts
import { Injectable } from "@nestjs/common";
import { Brand } from "src/products/brand/entities/brand.entity";
import { Product } from "src/products/product/entities/product.entity";
import { Seller } from "src/products/seller/entities/seller.entity";
import { In } from "typeorm";
import { User } from "../user/entities/user.entity";
import { Favorite } from "./entities/favorite.entity";
import { EntityTypeEnum } from "./enums/entity-type.enum";
import { UserType } from "./enums/user-type.enum";

@Injectable()
export class FavoriteService {
  async findFavorites(
    type: EntityTypeEnum,
    user: User,
    isRealUserType: boolean,
  ): Promise<Product[] | Brand[] | Seller[]> {
    const favorites: Favorite[] = await Favorite.findBy({
      entityType: type,
      userId: user.id,
      usertype: isRealUserType ? UserType.REAL : UserType.LEGAL,
    });
    const favoriteIds = favorites.map(favorite => favorite.entityId);
    if (type === EntityTypeEnum.PRODUCT) {
      return Product.findBy({
        id: In(favoriteIds),
      }) as Promise<Product[]>;
    }

    if (type === EntityTypeEnum.BASKET) {
      return Product.findBy({
        id: In(favoriteIds),
      }) as Promise<Product[]>;
    }

    if (type === EntityTypeEnum.SELLER) {
      return Seller.findBy({
        id: In(favoriteIds),
      }) as Promise<Seller[]>;
    }

    if (type === EntityTypeEnum.BRAND) {
      return Brand.findBy({
        id: In(favoriteIds),
      }) as Promise<Brand[]>;
    }
  }
  async isFavorite(
    userId: number,
    entityId: number,
    entityType: EntityTypeEnum,
    isRealUserType: boolean,
  ): Promise<boolean> {
    const count = await Favorite.count({
      where: {
        userId,
        entityId,
        entityType,
        usertype: isRealUserType ? UserType.REAL : UserType.LEGAL,
      },
    });

    return count > 0;
  }

  async updateFavorite(
    userData: User,
    entityId: number,
    entityType: EntityTypeEnum, // 'brand', 'seller', or 'product'
    isRealUserType: boolean,
  ) {
    try {
      const whatUserId = User.findOneBy({ id: userData.id });
      const id = (await whatUserId).id;

      const existFavorite = await Favorite.findOneBy({
        entityType,
        userId: id,
        entityId,
        usertype: isRealUserType ? UserType.REAL : UserType.LEGAL,
      });
      if (existFavorite) {
        await existFavorite.remove();
        return false;
      }

      const userFavorite = Favorite.create();
      // if(await UserFavorite.findBy({type:type,userId:userId})){
      //   throw 'duplicate'
      // }
      userFavorite.entityType = entityType;

      userFavorite.user = Promise.resolve({ id: id } as User);
      userFavorite.entityId = entityId;
      userFavorite.usertype = isRealUserType ? UserType.REAL : UserType.LEGAL;
      await userFavorite.save();
      return true;
    } catch (error) {
      console.error("Error adding favorite item:", error);
      throw error;
    }
  }
}
