import { Injectable, NotFoundException } from "@nestjs/common";
import { I18n, I18nService } from "nestjs-i18n";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { CreateSellerRepresentativeInput } from "./dto/create-seller-representative.input";
import { IndexSellerRepresentativeInput } from "./dto/index-seller-representative.input";
import { PaginationSellerRepresentativeResponse } from "./dto/pagination-seller-representative.response";
import { UpdateSellerRepresentativeInput } from "./dto/update-seller-representative.input";
import { SellerRepresentative } from "./entities/seller-representative.entity";
import { Seller } from "./entities/seller.entity";
import { Offer } from "../offer/entities/offer.entity";
import { SearchSellerRepresentativeInput } from "./dto/search-seller-representative.input";

@Injectable()
export class RepresentativeService {
  constructor(
    @I18n() protected readonly i18n: I18nService,
    private authorizationModule: AuthorizationService,
  ) {}

  async create(
    createSellerRepresentativeInput: CreateSellerRepresentativeInput,
    user: User,
  ): Promise<SellerRepresentative> {
    const sellerRepresentative: SellerRepresentative =
      SellerRepresentative.create<SellerRepresentative>({
        createdById: user.id,
        ...createSellerRepresentativeInput,
      });

    await sellerRepresentative.save();
    return sellerRepresentative;
  }

  async findAll(
    user: User,
    indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  ): Promise<SellerRepresentative[]> {
    const { take, skip } = indexSellerRepresentativeInput || {};

    return await SellerRepresentative.find({
      skip,
      take,
      order: { id: "DESC" },
    });
  }

  async paginate(
    user: User,
    indexSellerRepresentativeInput?: IndexSellerRepresentativeInput,
  ): Promise<PaginationSellerRepresentativeResponse> {
    indexSellerRepresentativeInput.boot();
    const { take, skip } = indexSellerRepresentativeInput || {};

    const [data, total] = await SellerRepresentative.findAndCount({
      skip,
      take,
      order: { id: "DESC" },
    });

    return PaginationSellerRepresentativeResponse.make(
      indexSellerRepresentativeInput,
      total,
      data,
    );
  }

  async findOne(id: number): Promise<SellerRepresentative> {
    const sellerRepresentative = await SellerRepresentative.findOneBy({ id });
    if (!sellerRepresentative) {
      throw new NotFoundException();
    }
    return sellerRepresentative;
  }

  async myProfileSeller(id: number,name:string, searchSellerRepresentativeInput:SearchSellerRepresentativeInput): Promise<Seller> {
    const sellerRepresentative = await SellerRepresentative.findOneBy({userId : id });
    if (!sellerRepresentative) {
      throw new NotFoundException();
    }
    const seller = Seller.findOneBy({ id: sellerRepresentative.sellerId });

    const querybuilder = Offer.createQueryBuilder()
  
    const result = await querybuilder
      .leftJoinAndSelect(`${querybuilder.alias}.product`, 'product')
      .where(`${querybuilder.alias}.sellerId = :sellerId`, { sellerId: sellerRepresentative.sellerId })
      .andWhere('LOWER(product.name) LIKE LOWER(:name)', { name: `%${name}%` })
      .orderBy(`${querybuilder.alias}.createdAt`, 'DESC')
      .take(searchSellerRepresentativeInput.perPage)
      .skip(searchSellerRepresentativeInput.skip)
      .getMany();
    
    
  
    (await seller).myProduct = Promise.resolve(result);

    return seller
    
  }

  

  async update(
    id: number,
    updateSellerRepresentativeInput: UpdateSellerRepresentativeInput,
    user: User,
  ): Promise<SellerRepresentative> {
    const sellerRepresentative: SellerRepresentative =
      await SellerRepresentative.preload({
        id,
        ...updateSellerRepresentativeInput,
      });
    if (!sellerRepresentative) {
      throw new NotFoundException();
    }

    await sellerRepresentative.save();
    return sellerRepresentative;
  }

  async remove(id: number): Promise<SellerRepresentative> {
    const sellerRepresentative: SellerRepresentative = await this.findOne(id);
    await sellerRepresentative.remove();
    sellerRepresentative.id = id;
    return sellerRepresentative;
  }
}
