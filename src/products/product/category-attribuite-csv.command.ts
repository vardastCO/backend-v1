import { ConfigService } from "@nestjs/config";
import * as Fs from "fs";
import { Client } from "minio";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { InjectMinio } from "nestjs-minio";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Attribute } from "../attribute/entities/attribute.entity";
import { AttributeTypesEnum } from "../attribute/enums/attribute-types.enum";
import { EntityManager } from 'typeorm';
@Command({
  name: "category:update",
  description: "update category from given csv file base on official format.",
})
export class CategoryCsvUpdateFilterCommand extends CommandRunner {
  private headerMap = {
    category: "category",
    filter: "filter",
  };

  private valueMap = {
    csvAttributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
        .map(attribute => {
          attribute = attribute ?? "";

          const [category, filter] = attribute;
          return {
            category,
            filter,
          };
        })
        .filter(a => a)
        .reduce((carry, cleanAttribute) => {
          return carry;
        }, {});
    },
  };
  constructor(

    entityManager
    private readonly csvParser: CsvParser,
    @InjectMinio() private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {
    super();
  }
  async run(passedParam: string[], options?: any): Promise<void> {
    const [csvFile] = passedParam;
    const stream = Fs.createReadStream(csvFile, "utf8");

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
      // const { name, category, brand, sku, filter, uom } = csvProduct;
      const { category, filter } = csvProduct;

      try {
        const find_category: Category = await Category.findOneBy({
          title: category,
        });
        if (!find_category) {
          throw "not found category";
        }
        const parts = filter.split("-");

        // Loop through each part
        for (let i = 0; i < parts.length; i++) {
          const attributeSlug = `${parts[i]}:${find_category.id}`;
         
          let attribute: Attribute | null = await Attribute.findOneBy({
            slug: attributeSlug,
          });
          
          if (!attribute) {
            attribute = Attribute.create({
              name: parts[i],
              type: AttributeTypesEnum.TEXT,
              values: {},
              slug: attributeSlug,
              uomId: null,
            });
            attribute.categories = Promise.resolve([category]);
            await attribute.save();
          }
          await this.entityManager.query(
            `INSERT INTO product_attribute_categories ("attributeId", "categoryId") VALUES ($1, $2)`,
            [attribute.id,  find_category.id]
          )
        }
      } catch (e) {
        console.log("Error processing product:", e);
      }
    }

    console.log("All processed.");
  }
}

class CsvProduct {
  category: string;
  filter: string;
}
