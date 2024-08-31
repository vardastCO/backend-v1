import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { AttributeValue } from "src/products/attribute-value/entities/attribute-value.entity";
import { Attribute } from "src/products/attribute/entities/attribute.entity";
import { Image } from "src/products/images/entities/image.entity";
import { Offer } from "src/products/offer/entities/offer.entity";
import { Price } from "src/products/price/entities/price.entity";
import { EntityManager } from "typeorm";
import { In } from "typeorm";
import { Product } from "../entities/product.entity";
@Command({
  name: "extra:delete",
  description: "delete required from given csv file base on official format.",
})
export class DeleteProductCommand extends CommandRunner {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async run(): Promise<void> {
    const products = await Product.find({
      where: {
        categoryId: 3876,
      },
    });
    try {
      for (const product of products) {
        try {
          const attributeValues = await AttributeValue.findBy({
            productId: product.id,
          });
          await Promise.all(
            attributeValues.map(attributeValue => attributeValue.remove()),
          );

          // Remove Prices for the current product
          const prices = await Price.findBy({ productId: product.id });
          await Promise.all(prices.map(price => price.remove()));

          // Remove Offers for the current product
          const offers = await Offer.findBy({ productId: product.id });
          await Promise.all(offers.map(offer => offer.remove()));

          const images = await Image.findBy({ productId: product.id });
          await Promise.all(images.map(images => images.remove()));
          await product.remove();

          // Introduce a delay of 100 milliseconds
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          console.log("ffffff", e);
        }
      }

      console.log("All processed.");
    } catch (e) {
      console.log("ddd", e);
    }
  }
}
