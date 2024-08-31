import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { EntityManager } from "typeorm";
import { Product } from "./entities/product.entity";
import { Attribute } from "../attribute/entities/attribute.entity";
import { In } from "typeorm";
@Command({
  name: "required:update",
  description: "update required from given csv file base on official format.",
})
export class RequiredCsvUpdateFilterCommand extends CommandRunner {
  constructor(
    private readonly entityManager: EntityManager,
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async run(): Promise<void> {
    const products = await Product.find({ relations: ["category"] });
    try {
      for (const product of products) {
        try {
          const category = product.category;

          if (category) {
            const query = `
            SELECT "attributeId" 
            FROM product_attribute_categories
            WHERE "categoryId" = $1
          `;

            const resultsId = await this.entityManager.query(query, [
              (
                await category
              ).id, // Ensure that this is a valid integer
            ]);
            const attributeIds = resultsId.map(result => result.attributeId);
            const attribuites = Attribute.findBy({
              id: In(attributeIds),
            });

            for (const attribute of await attribuites) {
              try {
                // console.log("aatrribuite", attribute.name);
                attribute.isRequired = true;
                await attribute.save();
              } catch (e) {
                console.log("lll", e);
              }
            }
            console.log("done.");
            await new Promise(resolve => setTimeout(resolve, 100));
          }
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
