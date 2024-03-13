import { ConfigService } from "@nestjs/config";
import * as Fs from "fs";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { Offer } from "../offer/entities/offer.entity";
import { Product } from "./entities/product.entity";
import { Price } from "../price/entities/price.entity";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
import { PriceTypesEnum } from "../price/enums/price-types.enum";
import { DiscountPrice } from "../price/entities/price-discount.entity";
import { DiscountTypesEnum } from "../price/enums/price-discount-types.enum";

// Example array to store seller IDs
const sellerIds: { isCurrencyTrue: boolean; sellerId: number[] }[] = [];

// Example function to extract seller ID from a CSV file name
function extractSellerId(fileName: string) {
  const parts = fileName.split("-");

  // Check if there are enough parts and the first part is a valid currency code
  if (parts.length >= 2) {
    const currencyCode = parts[0];

    if (currencyCode === "01" || currencyCode === "02") {
      const sellerIdParts = parts.slice(1).map(part => parseInt(part, 10));

      if (sellerIdParts.every(part => !isNaN(part))) {
        return {
          isCurrencyTrue: currencyCode === "01",
          sellerId: sellerIdParts,
        };
      }
    }
  }

  return null; // Invalid format or unrecognized currency code
}

// Example usage

@Command({
  name: "seller:price",
  description: "price sellers from given csv file base on official format.",
})
export class SellerPriceUpdateCommand extends CommandRunner {
  private headerMap = {
    name: "name",
    sku: "sku",
    price: "price",
    discount: "discount",
    offprice : "offprice"
  };

  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
        .map(attribute => {
          attribute = attribute ?? "";
          // const [ name, category,brand,sku,filter,uom] = attribute;
          const [name, sku, price,discount,offprice] = attribute;
          return {
            name,
            sku,
            price,
            discount,
            offprice,
          };
        })
        .filter(a => a)
        .reduce((carry, cleanAttribute) => {
          return carry;
        }, {});
    },
  };
  constructor(
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async run(passedParam: string[], options?: any): Promise<void> {
    const [csvFile] = passedParam;
    const stream = Fs.createReadStream(csvFile, "utf8");
    passedParam.forEach(csvFile => {
      const result = extractSellerId(csvFile);
      if (result !== null) {
        sellerIds.push(result);
      }
    });
    console.log("Seller IDs:", sellerIds);
    const csvProducts = await this.csvParser.parse(
      stream,
      CsvProduct,
      null,
      null,
      {
        mapHeaders: ({ header, index }) => this.headerMap[header],
        mapValues: ({ header, index, value }) =>
          this.valueMap.hasOwnProperty(header)
            ? this.valueMap[header](value)
            : value,
        separator: ",",
      },
    );

    for (const csvProduct of csvProducts.list) {
      try {
        const { name, sku, price,discount,offprice } = csvProduct;
        let product = Product.findOneBy({ name });
        if (!product) {
          product = Product.findOneBy({ sku });
        }
        if (!product) {
          throw "d";
        }

        for (let i = 0; i < sellerIds.length; i++) {
          const sellerInfo = sellerIds[i];


          for (let j = 0; j < sellerInfo.sellerId.length; j++) {
            const singleSellerId = sellerInfo.sellerId[j];

            try {
              const existingOffer = await Offer.findOne({
                where: {
                  sellerId: singleSellerId,
                  productId: (await product).id,
                },
              });
            
              if (!existingOffer) {
                const offer = Offer.create();
                offer.productId = (await product).id;
                offer.sellerId = singleSellerId;
                offer.status = ThreeStateSupervisionStatuses.CONFIRMED;
                offer.isPublic = true;
                offer.isAvailable = true;
            
                await offer.save();
              }
            
            } catch (e) {
              console.log("Error processing product:", e);
            }

            try {
              console.log(
                "amount",
                price,
              );
              const priceModel = Price.create();
              if (price) {
              
                priceModel.sellerId = singleSellerId; // Set a single seller ID
                priceModel.productId = (await product).id; // Assuming productId is a string
                priceModel.isPublic = true;
                priceModel.createdById = 1;
                priceModel.amount = sellerInfo.isCurrencyTrue
                  ?  parseInt(price) / 10
                  :  parseInt(price);
                priceModel.type = PriceTypesEnum.CONSUMER;
                priceModel.save();
              }
              if (discount && offprice && priceModel) {

                const discount = DiscountPrice.create()
                discount.priceId = priceModel.id
                discount.id = priceModel.id
                discount.value = discount.toString()
                discount.type = DiscountTypesEnum.PERCENT;
               
                discount.calculated_price = offprice.toString();
                await discount.save()
              }
          
            } catch (e) {
              console.log("Error processing product:", e);
            }
          }

          try {
          } catch (e) {
            console.log("Error processing product:", e);
          }
        }
      } catch (e) {
        console.log("e");
      }

      console.log("All products processed.");
    }
  }
}

class CsvProduct {
  name: string;
  price: string;
  sku: string;
  discount: string;
  offprice: string;
}
