import * as Fs from "fs";
import { Command, CommandRunner } from "nest-commander";
import { CsvParser } from "nest-csv-parser";
import { Category } from "src/base/taxonomy/category/entities/category.entity";
import { Product } from "src/products/product/entities/product.entity";
import { ConfigService } from "@nestjs/config";
import { Client } from "minio";
import { InjectMinio } from "nestjs-minio";
import { AttributeValue } from "../attribute-value/entities/attribute-value.entity";
import { Attribute } from "../attribute/entities/attribute.entity";
import { AttributeTypesEnum } from "../attribute/enums/attribute-types.enum";
import { Uom } from "../uom/entities/uom.entity";

@Command({
  name: "product:up",
  description: "update products from given csv file base on official format.",
})
export class ProductCsvUpdateCommand extends CommandRunner {
  private headerMap = {
    "name": "name",
    "category": "category",
    "sku" : "sku",
    "attributes": "attributes",
  };

  private attributeRegex =
    /^([^\:]+)\:\s+([^\|\:]+)(?: +\| ([ضصثقفغعهخحجچپشسیبلاتنمکگظطزرژذدئوa-zA-Z0-9\.\s\/]+))?(?:- +([a-z0-9]+))?$/;

  private valueMap = {
    attributes: value => {
      const attributes = value.split(/\n|(\r\n)/) ?? [];
      return attributes
        .map(attribute => {
          attribute = attribute ?? "";
          if (!attribute.match(this.attributeRegex)) {
            console.warn(
              `Attribute '${attribute}' is not matching the regex provided, skipping.`
            );
            return null;
          }
          const [, name, value, uom, sku] = attribute.match(
            this.attributeRegex,
          );
          return {
            name,
            value: value.trim(),
            uom,
            sku,
          };
        })
        .filter(a => a)
        .reduce((carry, cleanAttribute) => {
          const currentAttributeValue = {
            value: cleanAttribute.value,
            sku: cleanAttribute.sku,
          };

          if (carry.hasOwnProperty(cleanAttribute.name)) {
            const existingAttribute = carry[cleanAttribute.name];

            const isDuplicate = existingAttribute.attributeValues.some(
              attrValue =>
                attrValue.value.trim()[0] === cleanAttribute.value.trim()[0] && 
                attrValue.value.trim().slice(-1) ===
                  cleanAttribute.value.trim().slice(-1),
            );

            if (!isDuplicate) {
              existingAttribute.attributeValues.push(currentAttributeValue);
              existingAttribute.values.options.push(cleanAttribute.value);
            }
          } else {
            carry[cleanAttribute.name] = {
              name: cleanAttribute.name,
              uom: cleanAttribute.uom,
              type: AttributeTypesEnum.TEXT,
              values: { options: [cleanAttribute.value] },
              attributeValues: [currentAttributeValue],
            };
          }
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

    const batchSize = 5;
    let batchCount = 0;
  
    for (let i = 0; i < csvProducts.list.length; i += batchSize) {
      const batch = csvProducts.list.slice(i, i + batchSize);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        for (const csvProduct of batch) {
          const { sku, attributes } = csvProduct;
          let product: Product = await Product.findOneBy({ sku: sku });

          if (!product) {
            throw new Error(`Product with SKU ${sku} not found`);
          }
          if ((await product.attributeValues).length > 0) {
            for (const attrName in attributes) {
              const csvAttribute = attributes[attrName];
              await this.addOrUpdateAttribute(product, csvAttribute);
            }
  
            await product.save();
          }
        }  
      } catch (e) {
        console.log('Error:', e);
      }
  
      batchCount++;
      console.log(`Batch ${batchCount} processed.`);
    }
  
    console.log("Finished.");
  }

  async addOrUpdateAttribute(product: Product, csvAttribute: any) {
    const attributeSlug = `${csvAttribute.name}:${product.categoryId}`;
    const attributeUom = csvAttribute.uom
      ? await this.firstOrCreateUom(csvAttribute.uom)
      : null;

    let attribute = await Attribute.findOne({
      where: {
        slug: attributeSlug,
        name: csvAttribute.name,
        ...(attributeUom && { uomId: attributeUom.id }),
      },
    });

    if (!attribute) {
      attribute = Attribute.create({
        name: csvAttribute.name,
        type: AttributeTypesEnum.TEXT,
        values: csvAttribute.values,
        slug: attributeSlug,
        uomId: attributeUom ? attributeUom.id : null,
      });
      attribute.categories = Promise.resolve([await product.category]);
      await attribute.save();
    } else {
      const existingCategories = await attribute.categories;
      existingCategories.push(await product.category);

      if (
        attribute.values &&
        Array.isArray(attribute.values.options) &&
        Array.isArray(csvAttribute.values.options)
      ) {
        for (const option of csvAttribute.values.options) {
          if (!attribute.values.options.includes(option)) {
            attribute.values.options.push(option);
          }
        }
      }

      await attribute.save();
    }

    for (const attributeValueCsv of csvAttribute.attributeValues) {
      const attributeValue = AttributeValue.create({
        ...attributeValueCsv,
      });
      attributeValue.product = Promise.resolve(product);
      attributeValue.attribute = Promise.resolve(attribute);
      await attributeValue.save();
    }
  }

  async firstOrCreateUom(name: string): Promise<Uom> {
    let uom = await Uom.findOneBy({ name: name });

    if (!uom) {
      uom = Uom.create({
        name: name,
        slug: name,
        symbol: name,
        isActive: true,
      });
      await uom.save();
    }

    return uom;
  }
}

class CsvProduct {
  name: string;
  category: string;
  sku: string;
  attributes: string;
}
