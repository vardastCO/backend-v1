import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { User } from "src/users/user/entities/user.entity";
import { DataSource } from "typeorm";
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { Product } from "../product/entities/product.entity";
import { SellerRepresentative } from "../seller/entities/seller-representative.entity";
import { ChartInput } from "./dto/chart-input";
import { ChartOutput } from "./dto/chart-output";
import { CreatePriceInput } from "./dto/create-price.input";
import { IndexPriceInput } from "./dto/index-price.input";
import { PaginationPriceResponse } from "./dto/pagination-price.response";
import { UpdatePriceInput } from "./dto/update-price.input";
import { Price } from "./entities/price.entity";
import { ChartEnum } from "./enums/chart.enum";
import { DiscountPrice } from "./entities/price-discount.entity";

@Injectable()
export class PriceService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource
  ){}
  async create(createPriceInput: CreatePriceInput, client: User): Promise<Price> {
    // if (createPriceInput.attributeValueId > 0) {
    //   const attributeIsValid = AttributeValue.createQueryBuilder()
    //     .where({
    //       id: createPriceInput.attributeValueId,
    //     })
    //     .getExists();

    //   if (!attributeIsValid) {
    //     throw new BadRequestException(
    //       "مشخصه انتخاب شده معتبر نیست یا فاقد sku است.",
    //     );
    //   }
    // }
   
    const price: Price = Price.create<Price>(createPriceInput);
    if (!createPriceInput.sellerId) {
      const sellerRepresentative = await SellerRepresentative.findOneBy({userId : client.id });
      if (!sellerRepresentative) {
        throw new NotFoundException();
      }
      price.sellerId = sellerRepresentative.sellerId
      
    }
    price.createdBy = Promise.resolve(client);
    await price.save();

    if (createPriceInput.valueDiscount) {
      const discount = DiscountPrice.create()
      discount.priceId = price.id
      discount.value = createPriceInput.valueDiscount
      discount.type = createPriceInput.typeDiscount;
      discount.calculated_price =
        (Number(price.amount) * (1 - Number(createPriceInput.valueDiscount))).toString();
  
    }
    return price;
  }

  async findAll(indexPriceInput?: IndexPriceInput): Promise<Price[]> {
    const { take, skip, type, productId, sellerId, isPublic, createdById } =
      indexPriceInput || {};
    return await Price.find({
      skip,
      take,
      where: { type, productId, sellerId, isPublic, createdById },
      order: { id: "DESC" },
    });
  }

  async paginate(
    indexPriceInput?: IndexPriceInput,
  ): Promise<PaginationPriceResponse> {
    indexPriceInput.boot();
    const { take, skip, type, productId, sellerId, isPublic, createdById } =
      indexPriceInput || {};
    const [data, total] = await Price.findAndCount({
      skip,
      take,
      where: { type, productId, sellerId, isPublic, createdById },
      order: { id: "DESC" },
    });

    return PaginationPriceResponse.make(indexPriceInput, total, data);
  }

  async findOne(id: number): Promise<Price> {
    const price = await Price.findOneBy({ id });
    if (!price) {
      throw new NotFoundException();
    }
    return price;
  }

  async update(id: number, updatePriceInput: UpdatePriceInput): Promise<Price> {
    const price: Price = await Price.preload({
      id,
      ...updatePriceInput,
    });
    if (!price) {
      throw new NotFoundException();
    }
    await price.save();
    return price;
  }

  async remove(id: number): Promise<Price> {
    const price: Price = await this.findOne(id);
    await price.remove();
    price.id = id;
    return price;
  }

  async getProductOf(price: Price): Promise<Product> {
    return await price.product;
  }

  // async getSupplierOf(price: Price): Promise<Supplier> {
  //   return await price.supplier;
  // }

  async getCreatedByOf(price: Price): Promise<User> {
    return await price.createdBy;
  }


  getDateFromEnum(type: ChartEnum): Date | null {
    const currentDate = new Date();
    switch(type) {
      case ChartEnum.DAILY:
        return new Date(currentDate.setDate(currentDate.getDate() - 1))
      case ChartEnum.WEEKLY:
        return new Date(currentDate.setDate(currentDate.getDate() - 7));
      case ChartEnum.MONTHLY:
        return new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      case ChartEnum.YEARLY:
        return new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
      default:
        return null; 
    }
  }

  async priceChart(chartInput: ChartInput): Promise<ChartOutput> {
    if (chartInput.type == ChartEnum.DAILY) {
      return { data: [], labels: [] };  
    }
    const { productId, type } = chartInput;
    const toDate = this.getDateFromEnum(type);
    const query = `
      WITH min_prices AS (
          SELECT 
              date_trunc('day', "createdAt"::date) AS date,
              MIN(amount) AS min_amount
          FROM product_prices 
          WHERE "productId" = $1
          GROUP BY date_trunc('day', "createdAt"::date)
      )
      SELECT 
          price."createdAt" AS "date",
          price.amount 
      FROM product_prices price 
      JOIN min_prices ON date_trunc('day', price."createdAt"::date) = min_prices.date AND price.amount = min_prices.min_amount
      WHERE price."productId" = $1 
        AND price."createdAt" BETWEEN $2 and NOW();
    `

    const data = await this.dataSource.query(query, [productId, toDate]);
  
    return data.reduce(
       (carry, current) => {
        carry.data.push(current.amount.toString());
        carry.labels.push(new Date(current.date).toISOString());
        return carry;
      },
      { data: [], labels: [] },
    );

  }

}
